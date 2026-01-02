const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

router.get('/register', (req, res) => {
  res.render('register');
});

const { validateRegister, validateLogin } = require('../middleware/validators');

router.post('/register', validateRegister, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      req.flash('error', 'Ez az email már regisztrálva van.');
      return res.redirect('/register');
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query('INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())', [name || null, email, hashed]);
    req.session.userId = result.insertId;
    req.flash('success', 'Sikeres regisztráció!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba történt a regisztráció során.');
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;
  try {
    const rows = await db.query('SELECT id, password FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      req.flash('error', 'Helytelen email vagy jelszó.');
      return res.redirect('/login');
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      req.flash('error', 'Helytelen email vagy jelszó.');
      return res.redirect('/login');
    }
    req.session.userId = user.id;
    req.flash('success', 'Sikeres belépés.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a bejelentkezés során.');
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;