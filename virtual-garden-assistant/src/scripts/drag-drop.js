import { addGardenElement } from './garden-renderer.js';
import { state, GRID_SIZE } from './main.js';

// Initialize drag and drop functionality
document.addEventListener('DOMContentLoaded', () => {
  initDragAndDrop();
});

/**
 * Initialize drag and drop functionality
 */
function initDragAndDrop() {
  const elementsContainer = document.querySelector('.elements-container');
  const gardenCanvas = document.getElementById('garden-canvas');

  if (!elementsContainer || !gardenCanvas) {
    console.error('Required DOM elements not found');
    return;
  }

  // Make garden canvas a drop target
  makeDropTarget(gardenCanvas);

  // Make all existing draggable elements draggable
  document.querySelectorAll('.draggable').forEach(element => {
    makeElementDraggable(element);
  });

  // Observe for new elements dynamically added to the container
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.classList.contains('draggable')) {
          makeElementDraggable(node);
        }
      });
    });
  });

  // Start observing the elements container
  observer.observe(elementsContainer, { childList: true, subtree: true });
}

/**
 * Make an element draggable
 * @param {HTMLElement} element - Element to make draggable
 */
function makeElementDraggable(element) {
  element.setAttribute('draggable', 'true');

  element.addEventListener('dragstart', (e) => {
    // Create a ghost image
    const ghostImage = element.cloneNode(true);
    ghostImage.classList.add('drag-preview');
    document.body.appendChild(ghostImage);

    // Set drag data
    const elementType = element.dataset.elementType;
    const elementId = element.dataset.elementId;
    
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: elementType,
      id: elementId
    }));

    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setDragImage(ghostImage, 30, 30);

    // Clean up ghost image after dragging
    setTimeout(() => {
      document.body.removeChild(ghostImage);
    }, 0);

    state.isDragging = true;
  });

  element.addEventListener('dragend', () => {
    state.isDragging = false;
  });
}

/**
 * Make an element a drop target
 * @param {HTMLElement} element - Element to make a drop target
 */
function makeDropTarget(element) {
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    element.classList.add('drop-active');
  });

  element.addEventListener('dragleave', (e) => {
    if (!element.contains(e.relatedTarget)) {
      element.classList.remove('drop-active');
    }
  });

  element.addEventListener('drop', async (e) => {
    e.preventDefault();
    element.classList.remove('drop-active');

    try {
      // Get drop coordinates relative to canvas
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert screen coordinates to normalized coordinates (-1 to 1)
      const normalizedX = (x / rect.width) * 2 - 1;
      const normalizedY = -(y / rect.height) * 2 + 1;

      // Convert normalized coordinates to world coordinates
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(normalizedX, normalizedY);
      
      // Import Three.js dynamically
      const THREE = await import('three');
      raycaster.setFromCamera(mouse, window.camera);

      // Create a ground plane for intersection
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

      // Snap to grid if enabled
      const snappedX = state.snapToGrid ? Math.round(intersectionPoint.x / GRID_SIZE) * GRID_SIZE : intersectionPoint.x;
      const snappedZ = state.snapToGrid ? Math.round(intersectionPoint.z / GRID_SIZE) * GRID_SIZE : intersectionPoint.z;

      // Get the dropped element data
      const elementData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // Import element loader dynamically
      const { getElementById } = await import('./element-loader.js');
      const elementTemplate = await getElementById(elementData.id);

      if (elementTemplate) {
        // Create new element instance
        const newElement = {
          ...elementTemplate,
          id: Date.now().toString(),
          position: { x: snappedX, y: 0, z: snappedZ },
          rotation: 0,
          properties: { ...elementTemplate.properties }
        };

        // Add element to garden
        addGardenElement(newElement);
        
        // Log for debugging
        console.log('Dropped element:', {
          position: newElement.position,
          type: newElement.type,
          id: newElement.id
        });
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  });
}

// Export the functions
export {
  initDragAndDrop,
  makeElementDraggable,
  makeDropTarget
};
