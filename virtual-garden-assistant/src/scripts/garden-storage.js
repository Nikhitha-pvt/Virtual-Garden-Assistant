/**
 * Garden storage module
 * Handles saving, loading, and managing garden designs
 */

/**
 * Save a garden design
 * @param {Array} elements - Garden elements to save
 * @param {string} name - Garden name
 * @param {string} description - Garden description
 * @returns {Promise} Promise that resolves with the saved garden object
 */
export function handleSaveGarden(elements, name, description = '') {
  return new Promise((resolve, reject) => {
    try {
      // Get existing gardens from local storage
      const gardens = JSON.parse(localStorage.getItem('gardens') || '[]');

      // Check if this garden already exists (by name)
      const existingIndex = gardens.findIndex(garden => garden.name === name);

      const garden = {
        id: existingIndex >= 0 ? gardens[existingIndex].id : Date.now().toString(),
        name,
        description,
        elements,
        lastModified: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        // Update existing garden
        gardens[existingIndex] = garden;
      } else {
        // Add new garden
        gardens.push(garden);
      }

      // Save to local storage
      localStorage.setItem('gardens', JSON.stringify(gardens));

      // In a real application, we would also save to a server here
      // using an API call

      resolve(garden);
    } catch (error) {
      console.error('Error saving garden:', error);
      reject(error);
    }
  });
}

/**
 * Load a garden design by ID
 * @param {string} gardenId - ID of garden to load
 * @returns {Promise} Promise that resolves with garden object
 */
export function handleLoadGarden(gardenId) {
  return new Promise((resolve, reject) => {
    try {
      // Get gardens from local storage
      const gardens = JSON.parse(localStorage.getItem('gardens') || '[]');

      // Find garden by ID
      const garden = gardens.find(g => g.id === gardenId);

      if (!garden) {
        reject(new Error(`Garden with ID ${gardenId} not found`));
        return;
      }

      // In a real application, we might fetch additional data from the server here

      resolve(garden);
    } catch (error) {
      console.error('Error loading garden:', error);
      reject(error);
    }
  });
}

/**
 * Delete a garden design
 * @param {string} gardenId - ID of garden to delete
 * @returns {Promise} Promise that resolves when garden is deleted
 */
export function handleDeleteGarden(gardenId) {
  return new Promise((resolve, reject) => {
    try {
      // Get gardens from local storage
      const gardens = JSON.parse(localStorage.getItem('gardens') || '[]');

      // Filter out the garden to delete
      const updatedGardens = gardens.filter(g => g.id !== gardenId);

      // Save updated list to local storage
      localStorage.setItem('gardens', JSON.stringify(updatedGardens));

      // In a real application, we would also delete from server here

      resolve();
    } catch (error) {
      console.error('Error deleting garden:', error);
      reject(error);
    }
  });
}

/**
 * Generate a share link for a garden
 * @param {Object} garden - Garden object to share
 * @returns {Promise} Promise that resolves with share link
 */
export function handleShareGarden(garden) {
  return new Promise((resolve) => {
    // In a real application, we would generate a unique sharing link
    // For now, we'll just encode the garden data in the URL
    const gardenData = encodeURIComponent(JSON.stringify({
      id: garden.id,
      name: garden.name,
      lastModified: garden.lastModified
    }));

    const shareLink = `${window.location.origin}${window.location.pathname}?garden=${gardenData}`;

    resolve(shareLink);
  });
}

/**
 * Load a shared garden from URL parameters
 * @returns {Object|null} Garden object or null if not found
 */
export function loadSharedGarden() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const gardenData = urlParams.get('garden');

    if (!gardenData) return null;

    const sharedInfo = JSON.parse(decodeURIComponent(gardenData));

    // In a real application, we would fetch the garden data from the server
    // using the ID from the shared link

    // For now, we'll check if we have this garden in local storage
    const gardens = JSON.parse(localStorage.getItem('gardens') || '[]');
    const garden = gardens.find(g => g.id === sharedInfo.id);

    return garden || null;
  } catch (error) {
    console.error('Error loading shared garden:', error);
    return null;
  }
}

/**
 * Export garden as JSON file
 * @param {Object} garden - Garden to export
 */
export function exportGardenAsJSON(garden) {
  try {
    // Create a JSON string
    const gardenJSON = JSON.stringify(garden, null, 2);

    // Create a blob
    const blob = new Blob([gardenJSON], { type: 'application/json' });

    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${garden.name.replace(/\s+/g, '_')}_garden.json`;

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error('Error exporting garden:', error);
    alert('Failed to export garden. Please try again.');
  }
}

/**
 * Import garden from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise} Promise that resolves with imported garden object
 */
export function importGardenFromJSON(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const garden = JSON.parse(event.target.result);

          // Validate garden object
          if (!garden.name || !garden.elements || !Array.isArray(garden.elements)) {
            reject(new Error('Invalid garden file format'));
            return;
          }

          // Generate a new ID to avoid conflicts
          garden.id = Date.now().toString();
          garden.lastModified = new Date().toISOString();

          // Save the imported garden
          handleSaveGarden(garden.elements, garden.name, garden.description)
            .then(savedGarden => {
              resolve(savedGarden);
            })
            .catch(error => {
              reject(error);
            });
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get all saved gardens
 * @returns {Array} Array of garden objects
 */
export function getAllGardens() {
  try {
    return JSON.parse(localStorage.getItem('gardens') || '[]');
  } catch (error) {
    console.error('Error getting all gardens:', error);
    return [];
  }
}

/**
 * Create a screenshot of the garden
 * @param {HTMLCanvasElement} canvas - WebGL canvas element
 * @returns {string} Data URL of the screenshot
 */
export function createGardenScreenshot(canvas) {
  try {
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating garden screenshot:', error);
    return null;
  }
}
