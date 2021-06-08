const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('../database');
const bcrypt = require('../bcrypt');

const validateUser = (username, password, done) => {
  pool.query('SELECT * FROM reddit_user WHERE email = ($1)', [username], (err, result) => {
    if (err) {
      return done(err);
    }
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (bcrypt.compare(password, user.password)) {
        return done(null, {
          id: user.id,
          email: user.email
        });
      } else {
        return done(null, false);
      }
    } else {
      return done(null, false);
    }
  });
};

passport.use(new LocalStrategy({
  usernameField: 'email'
}, validateUser));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  pool.query('SELECT * FROM reddit_user WHERE id = ($1)', [id], (err, result) => {
    if (err) {
      return done(err);
    }
    if (result.rows.length > 0) {
      const user = result.rows[0];
      return done(null, {
        id: user.id,
        email: user.email
      });
    } else {
      return done({ msg: 'Unknown ID' });
    }
  });
});

module.exports = passport;
