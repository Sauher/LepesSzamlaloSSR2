module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session && req.session.userId) return next();
    req.session.messages = { error: 'Kérlek jelentkezz be a folytatáshoz.' };
    return res.redirect('/login');
  }
};