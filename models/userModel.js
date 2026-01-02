const db = require('../config/db');

module.exports = {
  getById: async (id) => {
    const rows = await db.query('SELECT id, name, email, created_at, password FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  updateProfile: async (id, name) => {
    return await db.query('UPDATE users SET name = ? WHERE id = ?', [name || null, id]);
  },

  updatePassword: async (id, hashed) => {
    return await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
  }
};