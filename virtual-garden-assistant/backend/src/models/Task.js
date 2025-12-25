const pool = require('../config/database');

class Task {
  static async create({ gardenId, title, description, dueDate, priority, status = 'pending' }) {
    const [result] = await pool.execute(
      'INSERT INTO tasks (garden_id, title, description, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
      [gardenId, title, description, dueDate, priority, status]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByGardenId(gardenId) {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE garden_id = ? ORDER BY due_date ASC',
      [gardenId]
    );
    return rows;
  }

  static async update(id, { title, description, dueDate, priority, status }) {
    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, status = ? WHERE id = ?',
      [title, description, dueDate, priority, status, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
    return true;
  }

  static async getUpcomingTasks() {
    const [rows] = await pool.execute(
      'SELECT t.*, g.name as garden_name FROM tasks t JOIN gardens g ON t.garden_id = g.id WHERE t.status = "pending" AND t.due_date <= DATE_ADD(NOW(), INTERVAL 7 DAY) ORDER BY t.due_date ASC'
    );
    return rows;
  }

  static async getOverdueTasks() {
    const [rows] = await pool.execute(
      'SELECT t.*, g.name as garden_name FROM tasks t JOIN gardens g ON t.garden_id = g.id WHERE t.status = "pending" AND t.due_date < NOW() ORDER BY t.due_date ASC'
    );
    return rows;
  }
}

module.exports = Task; 