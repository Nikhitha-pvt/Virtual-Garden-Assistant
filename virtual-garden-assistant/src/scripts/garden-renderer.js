// Import dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { state, GARDEN_SIZE, GRID_SIZE } from './main.js';

// Private variables
let scene, camera, renderer, controls;
let gridHelper, groundMesh;
let elementMeshes = new Map(); // Map element id to its mesh
let isDragging = false;
let draggedElement = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isInitialized = false;
let currentMode = '2d'; // '2d' or '3d'
let modelCache = new Map(); // Cache for loaded 3D models

// Setup garden canvas
export function setupGardenCanvas(canvasContainer, gardenSize, gridSize, appState) {
  if (isInitialized) return;

  console.log('Setting up garden canvas...');

  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe9e9e9);
  window.scene = scene; // Expose scene globally

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  renderer.shadowMap.enabled = true;
  canvasContainer.appendChild(renderer.domElement);

  // Create camera for 2D view (orthographic)
  setupCameras();
  window.camera = camera; // Expose camera globally

  // Add grid
  setupGrid(gardenSize, gridSize);

  // Add ground
  setupGround(gardenSize);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Add directional light (sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(gardenSize / 2, gardenSize, gardenSize / 2);
  directionalLight.castShadow = true;

  // Adjust shadow properties for better quality
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.left = -gardenSize;
  directionalLight.shadow.camera.right = gardenSize;
  directionalLight.shadow.camera.top = gardenSize;
  directionalLight.shadow.camera.bottom = -gardenSize;
  scene.add(directionalLight);

  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mouseup', onMouseUp);

  // Start rendering
  isInitialized = true;
  animate();

  console.log('Garden canvas setup complete.');
}

// Setup cameras
function setupCameras() {
  // Orthographic camera for 2D view
  const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
  const frustumSize = GARDEN_SIZE * 1.1; // slightly larger than garden size

  camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    -1000, // Changed near plane to allow viewing objects below camera
    1000
  );

  camera.position.set(0, 50, 0); // Increased height for better view
  camera.lookAt(0, 0, 0);
  camera.zoom = 0.5; // Set initial zoom level
  camera.updateProjectionMatrix();

  // Set up orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.screenSpacePanning = true;

  // Limit orbit controls for 2D view
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableRotate = false;
}

// Setup grid
function setupGrid(size, gridSize) {
  // Remove existing grid if it exists
  if (gridHelper) scene.remove(gridHelper);

  // Create grid helper
  gridHelper = new THREE.GridHelper(size, size / gridSize, 0x888888, 0xcccccc);
  gridHelper.rotation.x = Math.PI / 2; // lay flat on xz plane
  gridHelper.position.y = 0.01; // slightly above ground to avoid z-fighting
  scene.add(gridHelper);
}

// Setup ground plane
function setupGround(size) {
  // Create ground plane
  const groundGeometry = new THREE.PlaneGeometry(size, size);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x8BC34A, // green grass color
    roughness: 0.8,
    metalness: 0.1
  });

  groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2; // lay flat
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
}

// Handle window resize
function onWindowResize() {
  const container = renderer.domElement.parentElement;
  const aspect = container.clientWidth / container.clientHeight;

  if (currentMode === '2d') {
    // Update orthographic camera
    const frustumSize = GARDEN_SIZE * 1.1;
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
  } else {
    // Update perspective camera
    camera.aspect = aspect;
  }

  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

// Switch between 2D and 3D views
export function switchToView(mode, appState) {
  if (mode === currentMode) return;

  currentMode = mode;

  if (mode === '2d') {
    // Switch to orthographic camera (top-down view)
    const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    const frustumSize = GARDEN_SIZE * 1.1;

    camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );

    camera.position.set(0, frustumSize, 0);
    camera.lookAt(0, 0, 0);

    // Update controls
    controls.dispose();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.enableRotate = false;
  } else {
    // Switch to perspective camera (3D view)
    const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;

    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(GARDEN_SIZE / 2, GARDEN_SIZE / 2, GARDEN_SIZE / 2);
    camera.lookAt(0, 0, 0);

    // Update controls
    controls.dispose();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.minDistance = 1;
    controls.maxDistance = GARDEN_SIZE * 1.5;
  }

  // Update the application state
  appState.currentView = mode;
}

// Mouse interaction handlers
function onMouseDown(event) {
  event.preventDefault();

  // Update mouse coordinates
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Check if we clicked on an element
  raycaster.setFromCamera(mouse, camera);

  // Get all meshes in the scene that represent elements
  const meshes = [];
  elementMeshes.forEach(mesh => {
    meshes.push(mesh);
  });

  const intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    // We clicked on an element
    const selectedMesh = intersects[0].object;

    // Find the element that owns this mesh
    let selectedElementId = null;
    elementMeshes.forEach((mesh, id) => {
      if (mesh === selectedMesh || mesh.children.includes(selectedMesh)) {
        selectedElementId = id;
      }
    });

    if (selectedElementId) {
      // Find the element in the garden elements
      const selectedElement = state.gardenElements.find(el => el.id === selectedElementId);
      if (selectedElement) {
        // Mark as dragging
        isDragging = true;
        draggedElement = selectedElement;
        state.selectedElement = selectedElement;

        // Show element properties in UI
        showElementProperties(selectedElement);
      }
    }
  } else {
    // Clicked on empty space, deselect current element
    state.selectedElement = null;
    hideElementProperties();
  }
}

function onMouseMove(event) {
  if (!isDragging || !draggedElement) return;

  // Update mouse coordinates
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Use raycaster to get intersection with ground plane
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(groundMesh);

  if (intersects.length > 0) {
    const intersectionPoint = intersects[0].point;

    // If snap to grid is enabled, snap to grid
    if (state.snapToGrid) {
      intersectionPoint.x = Math.round(intersectionPoint.x / GRID_SIZE) * GRID_SIZE;
      intersectionPoint.z = Math.round(intersectionPoint.z / GRID_SIZE) * GRID_SIZE;
    }

    // Update the element position
    draggedElement.position = {
      x: intersectionPoint.x,
      y: intersectionPoint.y,
      z: intersectionPoint.z
    };

    // Update the mesh position
    const mesh = elementMeshes.get(draggedElement.id);
    if (mesh) {
      mesh.position.copy(intersectionPoint);
    }
  }
}

function onMouseUp(event) {
  if (isDragging && draggedElement) {
    // Register the change for undo/redo
    import('./main.js').then(module => {
      module.registerChange();
    });
  }

  isDragging = false;
  draggedElement = null;
}

// Grid visibility toggle
export function updateGridVisibility(isVisible) {
  if (gridHelper) {
    gridHelper.visible = isVisible;
  }
}

// Zoom garden view
export function zoomGarden(zoomFactor) {
  if (currentMode === '2d') {
    // Adjust orthographic camera zoom
    const currentZoom = camera.zoom;
    const newZoom = Math.max(0.5, Math.min(3, currentZoom + zoomFactor));
    camera.zoom = newZoom;
    camera.updateProjectionMatrix();
  } else {
    // Adjust perspective camera position
    const zoomSpeed = 2;
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    camera.position.addScaledVector(cameraDirection, zoomFactor * zoomSpeed);
    controls.update();
  }
}

// Element properties panel handling
function showElementProperties(element) {
  const propertiesPanel = document.querySelector('.properties-panel');
  const propertiesForm = document.querySelector('.properties-form');

  // Clear previous properties
  propertiesForm.innerHTML = '';

  // Create form fields for element properties
  for (const [key, value] of Object.entries(element.properties || {})) {
    const formGroup = document.createElement('div');
    formGroup.className = 'mb-2';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = key.charAt(0).toUpperCase() + key.slice(1);

    const input = document.createElement('input');
    input.className = 'form-control form-control-sm';
    input.value = value;
    input.dataset.property = key;

    // Add event listener to update property when changed
    input.addEventListener('change', (e) => {
      element.properties[key] = e.target.value;
      updateElementVisual(element);
    });

    formGroup.appendChild(label);
    formGroup.appendChild(input);
    propertiesForm.appendChild(formGroup);
  }

  // Add rotation control
  const rotationGroup = document.createElement('div');
  rotationGroup.className = 'mb-2';

  const rotationLabel = document.createElement('label');
  rotationLabel.className = 'form-label';
  rotationLabel.textContent = 'Rotation (degrees)';

  const rotationInput = document.createElement('input');
  rotationInput.className = 'form-control form-control-sm';
  rotationInput.type = 'number';
  rotationInput.min = '0';
  rotationInput.max = '360';
  rotationInput.value = element.rotation || 0;

  rotationInput.addEventListener('change', (e) => {
    element.rotation = parseFloat(e.target.value);
    updateElementVisual(element);
  });

  rotationGroup.appendChild(rotationLabel);
  rotationGroup.appendChild(rotationInput);
  propertiesForm.appendChild(rotationGroup);

  // Add delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-sm btn-danger mt-2';
  deleteBtn.textContent = 'Delete Element';
  deleteBtn.addEventListener('click', () => {
    removeElement(element);
  });

  propertiesForm.appendChild(deleteBtn);

  // Show the panel
  propertiesPanel.style.display = 'block';
}

function hideElementProperties() {
  const propertiesPanel = document.querySelector('.properties-panel');
  propertiesPanel.style.display = 'none';
}

// Add a new element to the garden
export function addGardenElement(element) {
  // Generate a unique ID if not provided
  if (!element.id) {
    element.id = Date.now().toString();
  }

  // Add to state
  state.gardenElements.push(element);

  // Create visual representation
  createElementVisual(element).then(() => {
    // Register the change for undo/redo
    import('./main.js').then(module => {
      module.registerChange();
    });
  });

  return element;
}

// Remove an element from the garden
export function removeElement(element) {
  // Remove from state
  const index = state.gardenElements.findIndex(el => el.id === element.id);
  if (index !== -1) {
    state.gardenElements.splice(index, 1);
  }

  // Remove from scene
  const mesh = elementMeshes.get(element.id);
  if (mesh) {
    scene.remove(mesh);
    elementMeshes.delete(element.id);
  }

  // Hide properties panel
  hideElementProperties();

  // Register the change for undo/redo
  import('./main.js').then(module => {
    module.registerChange();
  });
}

// Create visual representation for an element
function createElementVisual(element) {
  return new Promise((resolve) => {
    // Create a basic geometry based on element type and properties
    let geometry, material, mesh;

    switch (element.type) {
      case 'surface':
        geometry = new THREE.BoxGeometry(
          element.properties.width || 1,
          element.properties.height || 0.1,
          element.properties.depth || 1
        );
        material = new THREE.MeshStandardMaterial({
          color: getMaterialColor(element.properties.material),
          roughness: 0.7
        });
        break;

      case 'path':
        geometry = new THREE.BoxGeometry(
          element.properties.width || 0.8,
          0.1,
          element.properties.length || 3
        );
        material = new THREE.MeshStandardMaterial({
          color: getMaterialColor(element.properties.material),
          roughness: 0.6
        });
        break;

      case 'tree':
      case 'bush':
      case 'flower':
        // Create cylinder for plants
        geometry = new THREE.CylinderGeometry(
          0.3, // top radius
          0.3, // bottom radius
          element.properties.height || 1, // height
          8 // segments
        );
        material = new THREE.MeshStandardMaterial({
          color: 0x2d5a27, // green color for plants
          roughness: 0.8
        });
        break;

      default:
        // Default box geometry for other types
        geometry = new THREE.BoxGeometry(
          element.properties.width || 1,
          element.properties.height || 1,
          element.properties.depth || 1
        );
        material = new THREE.MeshStandardMaterial({
          color: 0x808080,
          roughness: 0.5
        });
    }

    mesh = new THREE.Mesh(geometry, material);
    
    // Position the mesh with y offset based on height
    const yOffset = (element.properties.height || 1) / 2;
    mesh.position.set(
      element.position.x,
      yOffset, // Place element on top of the ground
      element.position.z
    );
    
    mesh.rotation.y = element.rotation || 0;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Store reference to the mesh
    elementMeshes.set(element.id, mesh);

    // Add to scene
    scene.add(mesh);
    
    // Log for debugging
    console.log('Created visual for element:', {
      id: element.id,
      type: element.type,
      position: mesh.position,
      dimensions: {
        width: element.properties.width,
        height: element.properties.height,
        depth: element.properties.depth
      }
    });

    resolve();
  });
}

// Get color for material type
function getMaterialColor(material) {
  switch (material) {
    case 'grass':
      return 0x3c8f3c;
    case 'concrete':
      return 0xcccccc;
    case 'brick':
      return 0xb35c44;
    case 'wood':
      return 0x8b4513;
    case 'gravel':
      return 0xa0a0a0;
    case 'soil':
      return 0x594833;
    default:
      return 0x808080;
  }
}

// Clear all elements from the scene
export function clearScene() {
  // Remove all element meshes
  elementMeshes.forEach((mesh) => {
    scene.remove(mesh);
  });

  elementMeshes.clear();
}

// Render all garden elements
export function renderGarden(elements) {
  // Clear existing elements
  clearScene();

  // Add each element
  if (elements && elements.length > 0) {
    elements.forEach(element => {
      createElementVisual(element);
    });
  }
}
