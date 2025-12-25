const pool = require('../config/database');

class Garden {
  static async create({ userId, name, location, size, description }) {
    const [result] = await pool.execute(
      'INSERT INTO gardens (user_id, name, location, size, description) VALUES (?, ?, ?, ?, ?)',
      [userId, name, location, size, description]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM gardens WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM gardens WHERE user_id = ?',
      [userId]
    );
    return rows;
  }

  static async update(id, { name, location, size, description }) {
    await pool.execute(
      'UPDATE gardens SET name = ?, location = ?, size = ?, description = ? WHERE id = ?',
      [name, location, size, description, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM gardens WHERE id = ?', [id]);
    return true;
  }

  static async getGardenStats(gardenId) {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT p.id) as total_plants,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as pending_tasks,
        COUNT(DISTINCT CASE WHEN t.due_date < NOW() AND t.status = 'pending' THEN t.id END) as overdue_tasks
      FROM gardens g
      LEFT JOIN plants p ON g.id = p.garden_id
      LEFT JOIN tasks t ON g.id = t.garden_id
      WHERE g.id = ?
    `, [gardenId]);
    return rows[0];
  }
}

module.exports = Garden; 