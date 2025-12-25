-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS virtual_garden;
USE virtual_garden;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gardens table
CREATE TABLE IF NOT EXISTS gardens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  size VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Plants table
CREATE TABLE IF NOT EXISTS plants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  garden_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(100),
  planting_date DATE,
  watering_frequency INT,
  sunlight_needs VARCHAR(50),
  notes TEXT,
  last_watered DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  garden_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  due_date DATE,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE
);

-- Garden elements table
CREATE TABLE IF NOT EXISTS garden_elements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  garden_id INT NOT NULL,
  element_type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  position_z FLOAT NOT NULL,
  rotation FLOAT DEFAULT 0,
  properties JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE
);

-- Element templates table
CREATE TABLE IF NOT EXISTS element_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  element_type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  thumbnail VARCHAR(255),
  model_path VARCHAR(255),
  properties JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some default element templates
INSERT INTO element_templates (element_type, category, name, thumbnail, properties) VALUES
-- Garden Plan elements
('surface', 'garden-plan', 'Grass Lawn', '/assets/images/elements/grass-lawn.svg', '{"width": 5, "depth": 5, "material": "grass"}'),
('surface', 'garden-plan', 'Concrete Patio', '/assets/images/elements/concrete-patio.svg', '{"width": 3, "depth": 3, "material": "concrete"}'),
('path', 'garden-plan', 'Brick Path', '/assets/images/elements/brick-path.svg', '{"width": 0.8, "length": 3, "material": "brick"}'),
('surface', 'garden-plan', 'Wooden Deck', '/assets/images/elements/wooden-deck.svg', '{"width": 4, "depth": 3, "material": "wood"}'),
('surface', 'garden-plan', 'Gravel Area', '/assets/images/elements/gravel-area.svg', '{"width": 2, "depth": 2, "material": "gravel"}'),

-- Plot elements
('plot', 'plot', 'Square Garden Bed', '/assets/images/elements/square-garden-bed.svg', '{"width": 2, "depth": 2, "height": 0.3, "material": "soil"}'),
('plot', 'plot', 'Rectangular Garden Bed', '/assets/images/elements/rectangular-garden-bed.svg', '{"width": 3, "depth": 1.5, "height": 0.3, "material": "soil"}'),
('plot', 'plot', 'Raised Garden Bed', '/assets/images/elements/raised-garden-bed.svg', '{"width": 2, "depth": 1, "height": 0.6, "material": "wood"}'),
('plot', 'plot', 'Circular Garden Bed', '/assets/images/elements/circular-garden-bed.svg', '{"radius": 1.2, "height": 0.3, "material": "soil"}'),
('plot', 'plot', 'Vegetable Plot', '/assets/images/elements/vegetable-plot.svg', '{"width": 2.5, "depth": 1.5, "height": 0.3, "material": "soil"}'),

-- Plants
('tree', 'plants', 'Oak Tree', '/assets/images/elements/oak-tree.svg', '{"height": 8, "canopy": 5, "species": "Oak"}'),
('tree', 'plants', 'Pine Tree', '/assets/images/elements/pine-tree.svg', '{"height": 10, "canopy": 3, "species": "Pine"}'),
('tree', 'plants', 'Apple Tree', '/assets/images/elements/apple-tree.svg', '{"height": 4, "canopy": 3, "species": "Apple", "fruit": true}'),
('bush', 'plants', 'Rose Bush', '/assets/images/elements/rose-bush.svg', '{"height": 1, "width": 0.8, "species": "Rose", "flowering": true}'),
('flower', 'plants', 'Lavender', '/assets/images/elements/lavender.svg', '{"height": 0.5, "spacing": 0.3, "species": "Lavender", "flowering": true}'),
('flower', 'plants', 'Tulips', '/assets/images/elements/tulips.svg', '{"height": 0.4, "spacing": 0.2, "species": "Tulip", "flowering": true}'),
('flower', 'plants', 'Sunflower', '/assets/images/elements/sunflower.svg', '{"height": 2, "spacing": 0.5, "species": "Sunflower", "flowering": true}'),

-- Houses
('house', 'houses', 'Small House', '/assets/images/elements/small-house.svg', '{"width": 8, "depth": 6, "height": 3, "stories": 1}'),
('house', 'houses', 'Garage', '/assets/images/elements/garage.svg', '{"width": 4, "depth": 6, "height": 2.5, "type": "garage"}'),
('house', 'houses', 'Garden Shed', '/assets/images/elements/garden-shed.svg', '{"width": 2.5, "depth": 2, "height": 2.2, "type": "shed"}'),
('house', 'houses', 'Greenhouse', '/assets/images/elements/greenhouse.svg', '{"width": 3, "depth": 2, "height": 2.2, "type": "greenhouse"}'),
('house', 'houses', 'Gazebo', '/assets/images/elements/gazebo.svg', '{"width": 3, "depth": 3, "height": 3, "type": "gazebo"}'),

-- Furniture
('furniture', 'furniture', 'Garden Bench', '/assets/images/elements/garden-bench.svg', '{"width": 1.5, "depth": 0.6, "height": 0.8, "material": "wood"}'),
('furniture', 'furniture', 'Outdoor Dining Set', '/assets/images/elements/dining-set.svg', '{"width": 2, "depth": 2, "height": 0.75, "seating": 4}'),
('furniture', 'furniture', 'Lounge Chair', '/assets/images/elements/lounge-chair.svg', '{"width": 0.7, "depth": 1.5, "height": 0.4, "material": "wood"}'),
('furniture', 'furniture', 'BBQ Grill', '/assets/images/elements/grill.svg', '{"width": 0.8, "depth": 0.6, "height": 1, "type": "grill"}'),
('furniture', 'furniture', 'Patio Umbrella', '/assets/images/elements/umbrella.svg', '{"radius": 1.5, "height": 2.5, "color": "blue"}'),

-- Ponds and Pools
('pond', 'ponds', 'Small Pond', '/assets/images/elements/small-pond.svg', '{"radius": 1, "depth": 0.5, "shape": "circular"}'),
('pond', 'ponds', 'Large Pond', '/assets/images/elements/large-pond.svg', '{"width": 3, "depth": 1, "length": 4, "shape": "irregular"}'),
('fountain', 'ponds', 'Fountain', '/assets/images/elements/fountain.svg', '{"radius": 0.8, "height": 1.5, "type": "tiered"}'),
('pool', 'ponds', 'Swimming Pool', '/assets/images/elements/swimming-pool.svg', '{"width": 5, "length": 8, "depth": 1.8, "shape": "rectangular"}'),
('pool', 'ponds', 'Hot Tub', '/assets/images/elements/hot-tub.svg', '{"radius": 1.2, "depth": 0.8, "shape": "circular"}'); 