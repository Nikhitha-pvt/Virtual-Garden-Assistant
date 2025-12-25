/**
 * Garden Elements Module
 * Defines the structure and behavior of garden elements
 */

// Base element class
class GardenElement {
  constructor(id, name, type, position = { x: 0, y: 0, z: 0 }, rotation = 0, properties = {}) {
    this.id = id || Date.now().toString();
    this.name = name;
    this.type = type;
    this.position = position;
    this.rotation = rotation;
    this.properties = properties;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position,
      rotation: this.rotation,
      properties: this.properties
    };
  }

  static fromJSON(json) {
    return new GardenElement(
      json.id,
      json.name,
      json.type,
      json.position,
      json.rotation,
      json.properties
    );
  }
}

// Surface element (lawn, patio, etc.)
class SurfaceElement extends GardenElement {
  constructor(id, name, position, rotation, properties) {
    super(id, name, 'surface', position, rotation, {
      width: properties.width || 5,
      depth: properties.depth || 5,
      material: properties.material || 'grass',
      ...properties
    });
  }
}

// Path element
class PathElement extends GardenElement {
  constructor(id, name, position, rotation, properties) {
    super(id, name, 'path', position, rotation, {
      width: properties.width || 0.8,
      length: properties.length || 3,
      material: properties.material || 'gravel',
      curved: properties.curved || false,
      ...properties
    });
  }
}

// Plant element
class PlantElement extends GardenElement {
  constructor(id, name, position, rotation, properties) {
    const type = properties.plantType || 'generic';
    super(id, name, type, position, rotation, {
      height: properties.height || 1,
      width: properties.width || 1,
      species: properties.species || 'Unknown',
      mature: properties.mature || false,
      flowering: properties.flowering || false,
      ...properties
    });
  }
}

// Tree element (extends Plant)
class TreeElement extends PlantElement {
  constructor(id, name, position, rotation, properties) {
    super(id, name, position, rotation, {
      plantType: 'tree',
      height: properties.height || 5,
      canopy: properties.canopy || 3,
      ...properties
    });
  }
}

// Bush element (extends Plant)
class BushElement extends PlantElement {
  constructor(id, name, position, rotation, properties) {
    super(id, name, position, rotation, {
      plantType: 'bush',
      height: properties.height || 1.2,
      width: properties.width || 1.5,
      ...properties
    });
  }
}

// Flower element (extends Plant)
class FlowerElement extends PlantElement {
  constructor(id, name, position, rotation, properties) {
    super(id, name, position, rotation, {
      plantType: 'flower',
      height: properties.height || 0.3,
      spacing: properties.spacing || 0.2,
      flowering: true,
      ...properties
    });
  }
}

// House element
class HouseElement extends GardenElement {
  constructor(id, name, position, rotation, properties) {
    super(id, name, 'house', position, rotation, {
      width: properties.width || 8,
      depth: properties.depth || 6,
      height: properties.height || 3,
      stories: properties.stories || 1,
      roofType: properties.roofType || 'gable',
      color: properties.color || '#e5e5e5',
      ...properties
    });
  }
}

// Furniture element
class FurnitureElement extends GardenElement {
  constructor(id, name, position, rotation, properties) {
    super(id, name, 'furniture', position, rotation, {
      width: properties.width || 1,
      depth: properties.depth || 1,
      height: properties.height || 0.5,
      material: properties.material || 'wood',
      color: properties.color || '#CD853F',
      ...properties
    });
  }
}

// Water feature element (pond, pool, etc.)
class WaterFeatureElement extends GardenElement {
  constructor(id, name, position, rotation, properties) {
    const type = properties.waterType || 'pond';
    super(id, name, type, position, rotation, {
      shape: properties.shape || 'circular',
      depth: properties.depth || 0.5,
      ...(properties.shape === 'circular'
        ? { radius: properties.radius || 1.5 }
        : { width: properties.width || 3, length: properties.length || 3 }),
      ...properties
    });
  }
}

// Note element
class NoteElement extends GardenElement {
  constructor(id, name, position, rotation, properties) {
    super(id, name, 'note', position, rotation, {
      text: properties.text || 'Note',
      fontSize: properties.fontSize || 14,
      color: properties.color || 'black',
      ...properties
    });
  }
}

// Element factory
class GardenElementFactory {
  static createElement(type, id, name, position, rotation, properties) {
    switch (type) {
      case 'surface':
        return new SurfaceElement(id, name, position, rotation, properties);
      case 'path':
        return new PathElement(id, name, position, rotation, properties);
      case 'tree':
        return new TreeElement(id, name, position, rotation, properties);
      case 'bush':
        return new BushElement(id, name, position, rotation, properties);
      case 'flower':
        return new FlowerElement(id, name, position, rotation, properties);
      case 'house':
        return new HouseElement(id, name, position, rotation, properties);
      case 'furniture':
        return new FurnitureElement(id, name, position, rotation, properties);
      case 'pond':
      case 'pool':
      case 'fountain':
        return new WaterFeatureElement(id, name, position, rotation, {
          waterType: type,
          ...properties
        });
      case 'note':
        return new NoteElement(id, name, position, rotation, properties);
      default:
        return new GardenElement(id, name, type, position, rotation, properties);
    }
  }

  static fromJSON(json) {
    return GardenElementFactory.createElement(
      json.type,
      json.id,
      json.name,
      json.position,
      json.rotation,
      json.properties
    );
  }
}

// Element validation
function validateElement(element) {
  // Basic validation
  if (!element.id || !element.type || !element.name) {
    return false;
  }

  // Position validation
  if (!element.position ||
      typeof element.position.x !== 'number' ||
      typeof element.position.z !== 'number') {
    return false;
  }

  // Type-specific validation
  switch (element.type) {
    case 'surface':
      return element.properties &&
             typeof element.properties.width === 'number' &&
             typeof element.properties.depth === 'number';
    case 'path':
      return element.properties &&
             typeof element.properties.width === 'number' &&
             typeof element.properties.length === 'number';
    case 'tree':
    case 'bush':
    case 'flower':
      return element.properties &&
             typeof element.properties.height === 'number';
    case 'house':
      return element.properties &&
             typeof element.properties.width === 'number' &&
             typeof element.properties.depth === 'number' &&
             typeof element.properties.height === 'number';
    case 'furniture':
      return element.properties &&
             typeof element.properties.width === 'number' &&
             typeof element.properties.depth === 'number';
    case 'pond':
    case 'pool':
      return element.properties &&
             ((element.properties.shape === 'circular' && typeof element.properties.radius === 'number') ||
              (element.properties.shape !== 'circular' && typeof element.properties.width === 'number' &&
               typeof element.properties.length === 'number'));
    default:
      return true;
  }
}

// Export classes and functions
export {
  GardenElement,
  SurfaceElement,
  PathElement,
  PlantElement,
  TreeElement,
  BushElement,
  FlowerElement,
  HouseElement,
  FurnitureElement,
  WaterFeatureElement,
  NoteElement,
  GardenElementFactory,
  validateElement
};
