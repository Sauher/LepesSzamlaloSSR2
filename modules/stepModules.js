const db = require('../config/db');

module.exports = {
  getByUser: async (userId) => {
    return await db.query('SELECT * FROM steps WHERE user_id = ? ORDER BY date DESC', [userId]);
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM steps WHERE id = ?', [id]);
    return rows[0];
  },

  getByUserAndDate: async (userId, date) => {
    const rows = await db.query('SELECT * FROM steps WHERE user_id = ? AND date = ?', [userId, date]);
    return rows[0];
  },

  create: async (userId, date, steps) => {
    return await db.query('INSERT INTO steps (user_id, date, steps) VALUES (?, ?, ?)', [userId, date, steps]);
  },

  updateById: async (id, userId, date, steps) => {
    return await db.query('UPDATE steps SET date = ?, steps = ? WHERE id = ? AND user_id = ?', [date, steps, id, userId]);
  },

  deleteById: async (id, userId) => {
    return await db.query('DELETE FROM steps WHERE id = ? AND user_id = ?', [id, userId]);
  },

  totalByUser: async (userId) => {
    const rows = await db.query('SELECT SUM(steps) as total FROM steps WHERE user_id = ?', [userId]);
    return rows[0].total || 0;
  },

  getRange: async (userId, fromDate, toDate) => {
    return await db.query('SELECT date, steps FROM steps WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC', [userId, fromDate, toDate]);
  }
};