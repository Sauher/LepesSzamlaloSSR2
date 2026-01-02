require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');

const PORT = process.env.PORT;

const app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));


app.use((req, res, next) => {
  req.flash = (type, msg) => {
    if (!req.session.messages) req.session.messages = {};
    if (!req.session.messages[type]) req.session.messages[type] = [];
    req.session.messages[type].push(msg);
  };
  res.locals.session = req.session;
  const raw = req.session.messages || {};
  const normalized = {};
  Object.keys(raw).forEach(k => {
    const v = raw[k];
    normalized[k] = Array.isArray(v) ? v : (v == null ? [] : [v]);
  });
  res.locals.messages = normalized;
  delete req.session.messages;
  res.locals.currentPath = req.path || '/';
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/steps', require('./routes/steps'));
app.use('/profile', require('./routes/profile'));
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
