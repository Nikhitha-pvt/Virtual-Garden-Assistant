/**
 * History Manager Module
 * Handles undo/redo functionality for the garden editor
 */

// History state
let undoStack = [];
let redoStack = [];
let maxHistoryLength = 50; // Maximum number of history states to store
let lastSavedState = null;

/**
 * Initialize the history manager
 */
export function initUndoRedo() {
  // Clear the stacks
  undoStack = [];
  redoStack = [];
  lastSavedState = null;

  // Add event listeners for keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Undo: Ctrl+Z or Cmd+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }

    // Redo: Ctrl+Y or Cmd+Shift+Z
    if (((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      redo();
    }
  });
}

/**
 * Register a change in the garden state
 * Call this after any change to the garden elements
 */
export function registerChange() {
  // Import state from main.js
  import('./main.js').then(module => {
    const { state } = module;

    // Create a snapshot of the current state
    const snapshot = {
      elements: JSON.parse(JSON.stringify(state.gardenElements)),
      timestamp: Date.now()
    };

    // Push to undo stack
    undoStack.push(snapshot);

    // Limit stack size
    if (undoStack.length > maxHistoryLength) {
      undoStack.shift();
    }

    // Clear redo stack when a new change is made
    redoStack = [];

    // Update UI
    updateUndoRedoButtons();
  });
}

/**
 * Undo the last action
 */
export function undo(stateObj) {
  // If no state object was passed, import it from main.js
  if (!stateObj) {
    import('./main.js').then(module => {
      undo(module.state);
    });
    return;
  }

  if (undoStack.length === 0) return;

  // Save current state to redo stack
  const currentState = {
    elements: JSON.parse(JSON.stringify(stateObj.gardenElements)),
    timestamp: Date.now()
  };

  redoStack.push(currentState);

  // Get previous state
  const previousState = undoStack.pop();

  // Apply the previous state
  stateObj.gardenElements = previousState.elements;

  // Update the garden view
  import('./main.js').then(module => {
    module.renderGarden();
  });

  // Update UI
  updateUndoRedoButtons();
}

/**
 * Redo the last undone action
 */
export function redo(stateObj) {
  // If no state object was passed, import it from main.js
  if (!stateObj) {
    import('./main.js').then(module => {
      redo(module.state);
    });
    return;
  }

  if (redoStack.length === 0) return;

  // Save current state to undo stack
  const currentState = {
    elements: JSON.parse(JSON.stringify(stateObj.gardenElements)),
    timestamp: Date.now()
  };

  undoStack.push(currentState);

  // Get next state
  const nextState = redoStack.pop();

  // Apply the next state
  stateObj.gardenElements = nextState.elements;

  // Update the garden view
  import('./main.js').then(module => {
    module.renderGarden();
  });

  // Update UI
  updateUndoRedoButtons();
}

/**
 * Save the current state as the last saved state
 * Used to determine if there are unsaved changes
 */
export function markCurrentStateAsSaved() {
  import('./main.js').then(module => {
    const { state } = module;

    lastSavedState = JSON.stringify(state.gardenElements);
  });
}

/**
 * Check if there are unsaved changes
 * @returns {boolean} True if there are unsaved changes
 */
export function hasUnsavedChanges() {
  import('./main.js').then(module => {
    const { state } = module;

    if (lastSavedState === null) return true;

    return JSON.stringify(state.gardenElements) !== lastSavedState;
  });
}

/**
 * Update the undo/redo buttons state
 */
function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('btn-undo');
  const redoBtn = document.getElementById('btn-redo');

  if (undoBtn) {
    undoBtn.disabled = undoStack.length === 0;
    undoBtn.classList.toggle('disabled', undoStack.length === 0);
  }

  if (redoBtn) {
    redoBtn.disabled = redoStack.length === 0;
    redoBtn.classList.toggle('disabled', redoStack.length === 0);
  }
}

/**
 * Clear the history
 * Call this when loading a new garden or creating a new garden
 */
export function clearHistory() {
  undoStack = [];
  redoStack = [];
  lastSavedState = null;
  updateUndoRedoButtons();
}

/**
 * Get current history state (for debugging)
 * @returns {Object} History state object
 */
export function getHistoryState() {
  return {
    undoStackSize: undoStack.length,
    redoStackSize: redoStack.length,
    hasSavedState: lastSavedState !== null
  };
}
