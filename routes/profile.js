const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { ensureAuthenticated } = require('../middleware/auth');
const userModel = require('../models/userModel');
const stepModel = require('../models/stepModel');


router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const user = await userModel.getById(req.session.userId);
    const total = await stepModel.totalByUser(req.session.userId);
    res.render('profile/index', { user, total });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a profil betöltésekor.');
    res.redirect('/dashboard');
  }
});

router.get('/edit', ensureAuthenticated, async (req, res) => {
  try {
    const user = await userModel.getById(req.session.userId);
    res.render('profile/edit', { user });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a profil betöltésekor.');
    res.redirect('/profile');
  }
});

router.post('/update', ensureAuthenticated, async (req, res) => {
  const { name } = req.body;
  if (name && name.length > 100) {
    req.flash('error', 'A név túl hosszú (max 100 karakter).');
    return res.redirect('/profile');
  }
  try {
    await userModel.updateProfile(req.session.userId, name);
    req.flash('success', 'Profil frissítve.');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a profil mentésekor.');
    res.redirect('/profile');
  }
});

router.get('/password', ensureAuthenticated, (req, res) => {
  res.render('profile/password');
});

const { validatePasswordChange } = require('../middleware/validators');

router.post('/password/update', ensureAuthenticated, validatePasswordChange, async (req, res) => {
  const { old_password, new_password } = req.body;
  try {
    const user = await userModel.getById(req.session.userId);
    const ok = await bcrypt.compare(old_password, user.password);
    if (!ok) {
      req.flash('error', 'A régi jelszó hibás.');
      return res.redirect('/profile/password');
    }
    const hashed = await bcrypt.hash(new_password, 10);
    await userModel.updatePassword(req.session.userId, hashed);
    req.flash('success', 'Jelszó sikeresen megváltoztatva.');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a jelszó módosítása közben.');
    res.redirect('/profile/password');
  }
});

module.exports = router;