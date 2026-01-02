const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const stepModel = require('../models/stepModel');

function validateDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}
function validateSteps(steps) {
  const n = Number(steps);
  return Number.isInteger(n) && n >= 0;
}

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const steps = await stepModel.getByUser(req.session.userId);
    const total = await stepModel.totalByUser(req.session.userId);
    res.render('steps/index', { steps, total });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a lépések lekérésekor.');
    res.redirect('/dashboard');
  }
});

router.get('/new', ensureAuthenticated, (req, res) => {
  const qdate = req.query.date;
  const step = qdate ? { date: new Date(qdate) } : null;
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const maxDate = `${y}-${m}-${d}`;
  res.render('steps/form', { step, maxDate });
});

router.get('/calendar/events', ensureAuthenticated, async (req, res) => {
  try {
    const rows = await stepModel.getByUser(req.session.userId);
    const events = rows.map(r => {
      const dt = (typeof r.date === 'string') ? new Date(r.date) : new Date(r.date);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      const start = `${y}-${m}-${d}`;
      return {id: r.id, title: r.steps + ' lépés', start };
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hiba az események lekérésekor.' });
  }
});

const { validateStep } = require('../middleware/validators');

router.post('/', ensureAuthenticated, validateStep, async (req, res) => {
  const { date, steps } = req.body;
  try {
    const existing = await stepModel.getByUserAndDate(req.session.userId, date);
    if (existing) {
      await stepModel.updateById(existing.id, req.session.userId, date, steps);
      req.flash('success', 'Lépésszám frissítve.');
    } else {
      await stepModel.create(req.session.userId, date, steps);
      req.flash('success', 'Lépésszám hozzáadva.');
    }
    res.redirect('/steps');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a lépések mentésekor.');
    res.redirect('/steps');
  }
});

router.post('/:id/update', ensureAuthenticated, validateStep, async (req, res) => {
  const { date, steps } = req.body;
  try {
    await stepModel.updateById(req.params.id, req.session.userId, date, steps);
    req.flash('success', 'Lépésszám frissítve.');
    res.redirect('/steps');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a frissítés során.');
    res.redirect('/steps');
  }
});

router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const step = await stepModel.getById(req.params.id);
    if (!step || step.user_id !== req.session.userId) {
      req.flash('error', 'Nincs jogosultságod ehhez a művelethez.');
      return res.redirect('/steps');
    }
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const maxDate = `${y}-${m}-${d}`;
    res.render('steps/form', { step, maxDate });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a lépés betöltésekor.');
    res.redirect('/steps');
  }
});


router.post('/:id/delete', ensureAuthenticated, async (req, res) => {
  try {
    await stepModel.deleteById(req.params.id, req.session.userId);
    req.flash('success', 'Lépés törölve.');
    res.redirect('/steps');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a törlés során.');
    res.redirect('/steps');
  }
});

router.get('/calendar/view', ensureAuthenticated, async (req, res) => {
  try {
    const rows = await stepModel.getByUser(req.session.userId);
    res.render('steps/calendar', { rows });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a naptár betöltésekor.');
    res.redirect('/steps');
  }
});

router.get('/chart/view', ensureAuthenticated, async (req, res) => {
  try {
    const period = Number(req.query.period) || 30; // days
    const today = new Date();
    const prior = new Date();
    prior.setDate(today.getDate() - (period - 1));
    const from = prior.toISOString().slice(0,10);
    const to = today.toISOString().slice(0,10);
    const data = await stepModel.getRange(req.session.userId, from, to);
    res.render('steps/chart', { data, from, to, period });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Hiba a grafikon betöltésekor.');
    res.redirect('/steps');
  }
});

module.exports = router;