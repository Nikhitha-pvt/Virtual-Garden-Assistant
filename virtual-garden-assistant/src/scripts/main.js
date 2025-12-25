// Import dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './garden-elements.js';
import './drag-drop.js';
import { setupGardenCanvas, switchToView } from './garden-renderer.js';
import { loadGardenElements, populateElementsPanel } from './element-loader.js';
import { handleSaveGarden, handleLoadGarden, handleShareGarden, handleDeleteGarden } from './garden-storage.js';
import { initUndoRedo, registerChange, undo, redo } from './history-manager.js';

// Constants
export const GARDEN_SIZE = 30; // 30x30 meters default garden size
export const GRID_SIZE = 0.5; // Grid size in meters (0.5m)

// Global state
export const state = {
  currentCategory: 'garden-plan', // Default category
  currentView: '2d', // 2D or 3D view
  selectedElement: null,
  gardenElements: [], // Array of elements in the garden
  gridVisible: true,
  snapToGrid: true,
  currentGarden: null, // Current loaded garden
  isDragging: false,
};

// Expose camera and scene globally for drag-drop functionality
window.camera = null;
window.scene = null;

// DOM Elements
const gardenCanvas = document.getElementById('garden-canvas');
const toolCategories = document.querySelectorAll('.tool-category');
const elementsContainer = document.querySelector('.elements-container');
const propertiesPanel = document.querySelector('.properties-panel');
const btnNewDrawing = document.getElementById('btn-new-drawing');
const btn2DView = document.getElementById('btn-2d-view');
const btn3DView = document.getElementById('btn-3d-view');
const btnGrid = document.getElementById('btn-grid');
const btnSnap = document.getElementById('btn-snap');
const btnSave = document.getElementById('btn-save');
const btnSaveAs = document.getElementById('btn-save-as');
const btnShare = document.getElementById('btn-share');
const btnDelete = document.getElementById('btn-delete');
const btnUndo = document.getElementById('btn-undo');
const btnRedo = document.getElementById('btn-redo');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const saveModal = new bootstrap.Modal(document.getElementById('save-modal'));
const shareModal = new bootstrap.Modal(document.getElementById('share-modal'));
const savedGardensList = document.getElementById('saved-gardens-list');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Setup garden canvas
  setupGardenCanvas(gardenCanvas, GARDEN_SIZE, GRID_SIZE, state);

  // Setup event listeners
  setupEventListeners();

  // Initialize drag and drop
  initDragAndDrop();

  // Initialize undo/redo
  initUndoRedo();

  // Load initial elements
  loadGardenElements();
});

// Event Listeners
function setupEventListeners() {
  // Category selection
  toolCategories.forEach(category => {
    category.addEventListener('click', () => {
      const categoryName = category.dataset.category;

      // Update active category
      toolCategories.forEach(c => c.classList.remove('active'));
      category.classList.add('active');

      // Update state and refresh elements panel
      state.currentCategory = categoryName;
      populateElementsPanel(categoryName, elementsContainer);
    });
  });

  // View control buttons
  btn2DView.addEventListener('click', () => {
    btn2DView.classList.add('active');
    btn3DView.classList.remove('active');
    switchToView('2d', state);
  });

  btn3DView.addEventListener('click', () => {
    btn3DView.classList.add('active');
    btn2DView.classList.remove('active');
    switchToView('3d', state);
  });

  // Grid visibility toggle
  btnGrid.addEventListener('click', () => {
    btnGrid.classList.toggle('active');
    state.gridVisible = btnGrid.classList.contains('active');
    // Update grid visibility in renderer
    updateGridVisibility(state.gridVisible);
  });

  // Snap to grid toggle
  btnSnap.addEventListener('click', () => {
    btnSnap.classList.toggle('active');
    state.snapToGrid = btnSnap.classList.contains('active');
  });

  // New drawing button
  btnNewDrawing.addEventListener('click', () => {
    if (confirm('Create a new garden? Current unsaved changes will be lost.')) {
      state.gardenElements = [];
      state.currentGarden = null;
      clearGarden();
      registerChange();
    }
  });

  // Save/Load Garden
  btnSave.addEventListener('click', () => {
    if (state.currentGarden) {
      // Quick save existing garden
      handleSaveGarden(state.gardenElements, state.currentGarden.name, state.currentGarden.description);
    } else {
      // Show save modal for new garden
      saveModal.show();
    }
  });

  btnSaveAs.addEventListener('click', () => {
    saveModal.show();
  });

  // Save confirmation
  document.getElementById('btn-save-confirm').addEventListener('click', () => {
    const gardenName = document.getElementById('garden-name').value;
    const gardenDescription = document.getElementById('garden-description').value;

    if (gardenName) {
      handleSaveGarden(state.gardenElements, gardenName, gardenDescription)
        .then(garden => {
          state.currentGarden = garden;
          saveModal.hide();
          loadSavedGardens();
        })
        .catch(error => {
          console.error('Error saving garden:', error);
          alert('Failed to save the garden. Please try again.');
        });
    }
  });

  // Share garden
  btnShare.addEventListener('click', () => {
    if (!state.currentGarden) {
      alert('Please save your garden first before sharing.');
      return;
    }

    handleShareGarden(state.currentGarden)
      .then(shareLink => {
        document.getElementById('share-link').value = shareLink;
        shareModal.show();
      })
      .catch(error => {
        console.error('Error sharing garden:', error);
        alert('Failed to generate share link. Please try again.');
      });
  });

  // Copy share link
  document.getElementById('btn-copy-link').addEventListener('click', () => {
    const shareLink = document.getElementById('share-link');
    shareLink.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
  });

  // Delete garden
  btnDelete.addEventListener('click', () => {
    if (!state.currentGarden) {
      alert('No garden is currently loaded.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${state.currentGarden.name}"?`)) {
      handleDeleteGarden(state.currentGarden.id)
        .then(() => {
          state.gardenElements = [];
          state.currentGarden = null;
          clearGarden();
          loadSavedGardens();
        })
        .catch(error => {
          console.error('Error deleting garden:', error);
          alert('Failed to delete the garden. Please try again.');
        });
    }
  });

  // Undo/Redo
  btnUndo.addEventListener('click', () => {
    undo(state);
  });

  btnRedo.addEventListener('click', () => {
    redo(state);
  });

  // Zoom controls
  btnZoomIn.addEventListener('click', () => {
    zoomGarden(0.1);
  });

  btnZoomOut.addEventListener('click', () => {
    zoomGarden(-0.1);
  });

  // Template selection
  document.querySelectorAll('[data-template]').forEach(templateBtn => {
    templateBtn.addEventListener('click', () => {
      const templateName = templateBtn.dataset.template;
      loadTemplate(templateName);
    });
  });
}

// Load saved gardens
function loadSavedGardens() {
  // Clear current list
  savedGardensList.innerHTML = '';

  // Get saved gardens from local storage
  const gardens = JSON.parse(localStorage.getItem('gardens') || '[]');

  if (gardens.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.innerHTML = '<span class="dropdown-item text-muted">No saved gardens</span>';
    savedGardensList.appendChild(emptyItem);
  } else {
    gardens.forEach(garden => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'dropdown-item';
      link.href = '#';
      link.textContent = garden.name;
      link.onclick = () => loadGarden(garden.id);
      item.appendChild(link);
      savedGardensList.appendChild(item);
    });
  }
}

// Load saved garden
function loadGarden(gardenId) {
  handleLoadGarden(gardenId)
    .then(garden => {
      state.currentGarden = garden;
      state.gardenElements = garden.elements;
      renderGarden();
      registerChange();
    })
    .catch(error => {
      console.error('Error loading garden:', error);
      alert('Failed to load the garden. Please try again.');
    });
}

// Load template
function loadTemplate(templateName) {
  fetch(`/public/assets/templates/${templateName}.json`)
    .then(response => response.json())
    .then(template => {
      state.gardenElements = template.elements;
      state.currentGarden = null;
      renderGarden();
      registerChange();
    })
    .catch(error => {
      console.error('Error loading template:', error);
      alert('Failed to load the template. Please try again.');
    });
}

// Clear garden
function clearGarden() {
  // Clear garden elements from the scene
  renderGarden();
}

// Render all garden elements
function renderGarden() {
  // This function will be implemented in garden-renderer.js
  // For now, just log the elements
  console.log('Rendering garden with elements:', state.gardenElements);
}

// Update grid visibility
function updateGridVisibility(isVisible) {
  // This function will be implemented in garden-renderer.js
  console.log('Grid visibility:', isVisible);
}

// Zoom garden view
function zoomGarden(zoomFactor) {
  // This function will be implemented in garden-renderer.js
  console.log('Zooming:', zoomFactor);
}

// Export important objects and functions
export {
  state,
  gardenCanvas,
  GARDEN_SIZE,
  GRID_SIZE,
  renderGarden,
};
