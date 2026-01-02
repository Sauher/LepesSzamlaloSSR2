module.exports = {
  validateRegister: (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('error', 'Email és jelszó megadása kötelező.');
      return res.redirect('/register');
    }
    if (password.length < 6) {
      req.flash('error', 'A jelszó legalább 6 karakter legyen.');
      return res.redirect('/register');
    }
    next();
  },

  validateLogin: (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('error', 'Email és jelszó megadása kötelező.');
      return res.redirect('/login');
    }
    next();
  },

  validateStep: (req, res, next) => {
    const { date, steps } = req.body;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      req.flash('error', 'Dátum formátum: YYYY-MM-DD.');
      return res.redirect('/steps');
    }
    const n = Number(steps);
    if (!Number.isInteger(n) || n < 0) {
      req.flash('error', 'Lépésszámnak 0 vagy pozitív egésznek kell lennie.');
      return res.redirect('/steps');
    }
    next();
  },

  validatePasswordChange: (req, res, next) => {
    const { old_password, new_password, new_password_confirm } = req.body;
    if (!old_password || !new_password || !new_password_confirm) {
      req.flash('error', 'Minden mező kitöltése szükséges.');
      return res.redirect('/profile/password');
    }
    if (new_password !== new_password_confirm) {
      req.flash('error', 'Az új jelszavak nem egyeznek.');
      return res.redirect('/profile/password');
    }
    if (new_password.length < 6) {
      req.flash('error', 'Az új jelszó legalább 6 karakter legyen.');
      return res.redirect('/profile/password');
    }
    next();
  }
};