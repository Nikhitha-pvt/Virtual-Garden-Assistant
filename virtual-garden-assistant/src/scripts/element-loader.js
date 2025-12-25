import { addGardenElement } from './garden-renderer.js';

// Garden element categories and their elements
let gardenElements = {
  'garden-plan': [],
  'plot': [],
  'houses': [],
  'plants': [],
  'furniture': [],
  'ponds': [],
  'notes': []
};

/**
 * Load all garden elements from the server or predefined data
 * @returns {Promise} Promise that resolves when elements are loaded
 */
export function loadGardenElements() {
  return new Promise((resolve, reject) => {
    try {
      // In a full implementation, this would fetch from a server
      // For now, we'll use predefined data
      initializePredefinedElements();
      resolve(gardenElements);
    } catch (error) {
      console.error('Error loading garden elements:', error);
      reject(error);
    }
  });
}

/**
 * Populate the elements panel with items from the selected category
 * @param {string} category - The category to display
 * @param {HTMLElement} container - The container to populate
 */
export function populateElementsPanel(category, container) {
  // Clear the container
  container.innerHTML = '';

  // Get elements for the selected category
  const elements = gardenElements[category] || [];

  if (elements.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'text-center p-3 text-muted';
    emptyMessage.textContent = 'No elements available in this category';
    container.appendChild(emptyMessage);
    return;
  }

  // Create element items
  elements.forEach(element => {
    const elementItem = document.createElement('div');
    elementItem.className = 'element-item draggable fade-in';
    elementItem.dataset.elementType = element.type;
    elementItem.dataset.elementId = element.id;

    const elementImg = document.createElement('div');
    elementImg.className = 'element-img';

    const img = document.createElement('img');
    img.src = element.thumbnail;
    img.alt = element.name;
    elementImg.appendChild(img);

    const elementName = document.createElement('div');
    elementName.className = 'element-name';
    elementName.textContent = element.name;

    elementItem.appendChild(elementImg);
    elementItem.appendChild(elementName);

    container.appendChild(elementItem);
  });
}

/**
 * Initialize predefined garden elements
 * These would normally come from a server
 */
function initializePredefinedElements() {
  // Garden Plan elements (base surfaces, etc.)
  gardenElements['garden-plan'] = [
    {
      id: 'grass-lawn',
      name: 'Grass Lawn',
      type: 'surface',
      thumbnail: '/assets/images/elements/grass-lawn.svg',
      properties: {
        width: 5,
        depth: 5,
        material: 'grass'
      }
    },
    {
      id: 'concrete-patio',
      name: 'Concrete Patio',
      type: 'surface',
      thumbnail: '/assets/images/elements/concrete-patio.svg',
      properties: {
        width: 3,
        depth: 3,
        material: 'concrete'
      }
    },
    {
      id: 'brick-path',
      name: 'Brick Path',
      type: 'path',
      thumbnail: '/assets/images/elements/brick-path.svg',
      properties: {
        width: 0.8,
        length: 3,
        material: 'brick'
      }
    },
    {
      id: 'wooden-deck',
      name: 'Wooden Deck',
      type: 'surface',
      thumbnail: '/assets/images/elements/wooden-deck.svg',
      properties: {
        width: 4,
        depth: 3,
        material: 'wood'
      }
    },
    {
      id: 'gravel-area',
      name: 'Gravel Area',
      type: 'surface',
      thumbnail: '/assets/images/elements/gravel-area.svg',
      properties: {
        width: 2,
        depth: 2,
        material: 'gravel'
      }
    }
  ];

  // Plot elements (garden beds, etc.)
  gardenElements['plot'] = [
    {
      id: 'square-garden-bed',
      name: 'Square Garden Bed',
      type: 'plot',
      thumbnail: '/assets/images/elements/square-garden-bed.svg',
      properties: {
        width: 2,
        depth: 2,
        height: 0.3,
        material: 'soil'
      }
    },
    {
      id: 'rectangular-garden-bed',
      name: 'Rectangular Garden Bed',
      type: 'plot',
      thumbnail: '/assets/images/elements/rectangular-garden-bed.svg',
      properties: {
        width: 3,
        depth: 1.5,
        height: 0.3,
        material: 'soil'
      }
    },
    {
      id: 'raised-garden-bed',
      name: 'Raised Garden Bed',
      type: 'plot',
      thumbnail: '/assets/images/elements/raised-garden-bed.svg',
      properties: {
        width: 2,
        depth: 1,
        height: 0.6,
        material: 'wood'
      }
    },
    {
      id: 'circular-garden-bed',
      name: 'Circular Garden Bed',
      type: 'plot',
      thumbnail: '/assets/images/elements/circular-garden-bed.svg',
      properties: {
        radius: 1.2,
        height: 0.3,
        material: 'soil'
      }
    },
    {
      id: 'vegetable-plot',
      name: 'Vegetable Plot',
      type: 'plot',
      thumbnail: '/assets/images/elements/vegetable-plot.svg',
      properties: {
        width: 2.5,
        depth: 1.5,
        height: 0.3,
        material: 'soil'
      }
    }
  ];

  // Houses and extensions
  gardenElements['houses'] = [
    {
      id: 'small-house',
      name: 'Small House',
      type: 'house',
      thumbnail: '/assets/images/elements/small-house.svg',
      properties: {
        width: 8,
        depth: 6,
        height: 3,
        stories: 1
      }
    },
    {
      id: 'garage',
      name: 'Garage',
      type: 'house',
      thumbnail: '/assets/images/elements/garage.svg',
      properties: {
        width: 4,
        depth: 6,
        height: 2.5,
        type: 'garage'
      }
    },
    {
      id: 'garden-shed',
      name: 'Garden Shed',
      type: 'house',
      thumbnail: '/assets/images/elements/garden-shed.svg',
      properties: {
        width: 2.5,
        depth: 2,
        height: 2.2,
        type: 'shed'
      }
    },
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      type: 'house',
      thumbnail: '/assets/images/elements/greenhouse.svg',
      properties: {
        width: 3,
        depth: 2,
        height: 2.2,
        type: 'greenhouse'
      }
    },
    {
      id: 'gazebo',
      name: 'Gazebo',
      type: 'house',
      thumbnail: '/assets/images/elements/gazebo.svg',
      properties: {
        width: 3,
        depth: 3,
        height: 3,
        type: 'gazebo'
      }
    }
  ];

  // Plants
  gardenElements['plants'] = [
    {
      id: 'oak-tree',
      name: 'Oak Tree',
      type: 'tree',
      thumbnail: '/assets/images/elements/oak-tree.svg',
      properties: {
        height: 8,
        canopy: 5,
        species: 'Oak'
      }
    },
    {
      id: 'pine-tree',
      name: 'Pine Tree',
      type: 'tree',
      thumbnail: '/assets/images/elements/pine-tree.svg',
      properties: {
        height: 10,
        canopy: 3,
        species: 'Pine'
      }
    },
    {
      id: 'apple-tree',
      name: 'Apple Tree',
      type: 'tree',
      thumbnail: '/assets/images/elements/apple-tree.svg',
      properties: {
        height: 4,
        canopy: 3,
        species: 'Apple',
        fruit: true
      }
    },
    {
      id: 'rose-bush',
      name: 'Rose Bush',
      type: 'bush',
      thumbnail: '/assets/images/elements/rose-bush.svg',
      properties: {
        height: 1,
        width: 0.8,
        species: 'Rose',
        flowering: true
      }
    },
    {
      id: 'lavender',
      name: 'Lavender',
      type: 'flower',
      thumbnail: '/assets/images/elements/lavender.svg',
      properties: {
        height: 0.5,
        spacing: 0.3,
        species: 'Lavender',
        flowering: true
      }
    },
    {
      id: 'tulips',
      name: 'Tulips',
      type: 'flower',
      thumbnail: '/assets/images/elements/tulips.svg',
      properties: {
        height: 0.4,
        spacing: 0.2,
        species: 'Tulip',
        flowering: true
      }
    },
    {
      id: 'hedge',
      name: 'Hedge',
      type: 'hedge',
      thumbnail: '/assets/images/elements/hedge.svg',
      properties: {
        height: 1.5,
        length: 3,
        width: 0.5,
        species: 'Boxwood'
      }
    },
    {
      id: 'grass-patch',
      name: 'Ornamental Grass',
      type: 'grass',
      thumbnail: '/assets/images/elements/ornamental-grass.svg',
      properties: {
        height: 1.2,
        width: 1,
        species: 'Pampas Grass'
      }
    },
    {
      id: 'sunflower',
      name: 'Sunflower',
      type: 'flower',
      thumbnail: '/assets/images/elements/sunflower.svg',
      properties: {
        height: 2,
        spacing: 0.5,
        species: 'Sunflower',
        flowering: true
      }
    },
    {
      id: 'maple-tree',
      name: 'Maple Tree',
      type: 'tree',
      thumbnail: '/assets/images/elements/maple-tree.svg',
      properties: {
        height: 7,
        canopy: 4,
        species: 'Maple'
      }
    }
  ];

  // Furniture
  gardenElements['furniture'] = [
    {
      id: 'garden-bench',
      name: 'Garden Bench',
      type: 'furniture',
      thumbnail: '/assets/images/elements/garden-bench.svg',
      properties: {
        width: 1.5,
        depth: 0.6,
        height: 0.8,
        material: 'wood'
      }
    },
    {
      id: 'dining-set',
      name: 'Outdoor Dining Set',
      type: 'furniture',
      thumbnail: '/assets/images/elements/dining-set.svg',
      properties: {
        width: 2,
        depth: 2,
        height: 0.75,
        seating: 4
      }
    },
    {
      id: 'lounge-chair',
      name: 'Lounge Chair',
      type: 'furniture',
      thumbnail: '/assets/images/elements/lounge-chair.svg',
      properties: {
        width: 0.7,
        depth: 1.5,
        height: 0.4,
        material: 'wood'
      }
    },
    {
      id: 'grill',
      name: 'BBQ Grill',
      type: 'furniture',
      thumbnail: '/assets/images/elements/grill.svg',
      properties: {
        width: 0.8,
        depth: 0.6,
        height: 1,
        type: 'grill'
      }
    },
    {
      id: 'umbrella',
      name: 'Patio Umbrella',
      type: 'furniture',
      thumbnail: '/assets/images/elements/umbrella.svg',
      properties: {
        radius: 1.5,
        height: 2.5,
        color: 'blue'
      }
    }
  ];

  // Ponds and Pools
  gardenElements['ponds'] = [
    {
      id: 'small-pond',
      name: 'Small Pond',
      type: 'pond',
      thumbnail: '/assets/images/elements/small-pond.svg',
      properties: {
        radius: 1,
        depth: 0.5,
        shape: 'circular'
      }
    },
    {
      id: 'large-pond',
      name: 'Large Pond',
      type: 'pond',
      thumbnail: '/assets/images/elements/large-pond.svg',
      properties: {
        width: 3,
        depth: 1,
        length: 4,
        shape: 'irregular'
      }
    },
    {
      id: 'fountain',
      name: 'Fountain',
      type: 'fountain',
      thumbnail: '/assets/images/elements/fountain.svg',
      properties: {
        radius: 0.8,
        height: 1.5,
        type: 'tiered'
      }
    },
    {
      id: 'swimming-pool',
      name: 'Swimming Pool',
      type: 'pool',
      thumbnail: '/assets/images/elements/swimming-pool.svg',
      properties: {
        width: 5,
        length: 8,
        depth: 1.8,
        shape: 'rectangular'
      }
    },
    {
      id: 'hot-tub',
      name: 'Hot Tub',
      type: 'pool',
      thumbnail: '/assets/images/elements/hot-tub.svg',
      properties: {
        radius: 1.2,
        depth: 0.8,
        shape: 'circular'
      }
    }
  ];

  // Notes
  gardenElements['notes'] = [
    {
      id: 'text-note',
      name: 'Text Note',
      type: 'note',
      thumbnail: '/assets/images/elements/text-note.svg',
      properties: {
        text: 'Edit this note',
        fontSize: 14,
        color: 'black'
      }
    },
    {
      id: 'measurement',
      name: 'Measurement',
      type: 'measurement',
      thumbnail: '/assets/images/elements/measurement.svg',
      properties: {
        length: 2,
        unit: 'm',
        color: 'red'
      }
    },
    {
      id: 'arrow',
      name: 'Arrow',
      type: 'arrow',
      thumbnail: '/assets/images/elements/arrow.svg',
      properties: {
        length: 1.5,
        color: 'black',
        width: 0.1
      }
    }
  ];
}

/**
 * Get element by ID
 * @param {string} id - Element ID to find
 * @returns {Object|null} Element object or null if not found
 */
export function getElementById(id) {
  console.log('Looking for element with ID:', id);
  console.log('Available categories:', Object.keys(gardenElements));
  
  for (const category in gardenElements) {
    console.log(`Searching in category ${category}:`, gardenElements[category].length, 'elements');
    const element = gardenElements[category].find(el => el.id === id);
    if (element) {
      console.log('Found element:', element);
      return element;
    }
  }
  
  console.warn('Element not found with ID:', id);
  return null;
}

/**
 * Get elements by category
 * @param {string} category - Category to retrieve
 * @returns {Array} Array of elements in the category
 */
export function getElementsByCategory(category) {
  return gardenElements[category] || [];
}

/**
 * Search elements by name
 * @param {string} searchTerm - Term to search for
 * @returns {Array} Array of matching elements
 */
export function searchElements(searchTerm) {
  const results = [];
  const term = searchTerm.toLowerCase();

  for (const category in gardenElements) {
    const matches = gardenElements[category].filter(el =>
      el.name.toLowerCase().includes(term) ||
      (el.properties && el.properties.species && el.properties.species.toLowerCase().includes(term))
    );
    results.push(...matches);
  }

  return results;
}
