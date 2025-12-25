const pool = require('../config/database');

class Plant {
  static async create({ gardenId, name, species, plantingDate, wateringFrequency, sunlightNeeds, notes }) {
    const [result] = await pool.execute(
      'INSERT INTO plants (garden_id, name, species, planting_date, watering_frequency, sunlight_needs, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [gardenId, name, species, plantingDate, wateringFrequency, sunlightNeeds, notes]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM plants WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByGardenId(gardenId) {
    const [rows] = await pool.execute(
      'SELECT * FROM plants WHERE garden_id = ?',
      [gardenId]
    );
    return rows;
  }

  static async update(id, { name, species, plantingDate, wateringFrequency, sunlightNeeds, notes }) {
    await pool.execute(
      'UPDATE plants SET name = ?, species = ?, planting_date = ?, watering_frequency = ?, sunlight_needs = ?, notes = ? WHERE id = ?',
      [name, species, plantingDate, wateringFrequency, sunlightNeeds, notes, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM plants WHERE id = ?', [id]);
    return true;
  }

  static async getWateringSchedule(gardenId) {
    const [rows] = await pool.execute(`
      SELECT p.*, 
             DATE_ADD(p.last_watered, INTERVAL p.watering_frequency DAY) as next_watering_date
      FROM plants p
      WHERE p.garden_id = ?
      ORDER BY next_watering_date ASC
    `, [gardenId]);
    return rows;
  }

  static async updateLastWatered(id) {
    await pool.execute(
      'UPDATE plants SET last_watered = CURRENT_DATE WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }
}

module.exports = Plant; 