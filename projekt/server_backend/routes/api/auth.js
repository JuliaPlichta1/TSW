const express = require('express');
const { pool } = require('../../database');
const router = express.Router();
const passport = require('../../passport');
const bcrypt = require('../../bcrypt');

const { isAuth, rejectMethod } = require('../index');

router.route('/login')
  .post(passport.authenticate('local'), (req, res) => {
    res.status(200).send({
      isAuthenticated: req.isAuthenticated(),
      user: req.user
    });
  })
  .all(rejectMethod);

router.route('/logout')
  .get(isAuth, (req, res) => {
    req.logout();
    res.send('Logged out');
  })
  .all(rejectMethod);

router.route('/register')
  .post(async(req, res) => {
    const result = await pool.query('SELECT * FROM reddit_user WHERE email = ($1)', [req.body.email]);
    if (result.rows.length > 0) {
      res.send('This email is already in use');
    } else {
      const hashedPassword = bcrypt.hash(req.body.password);
      try {
        const insertUser = 'INSERT INTO reddit_user (email, password) VALUES ($1, $2) RETURNING *';
        const result = await pool.query(insertUser, [req.body.email, hashedPassword]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          res.status(200).send({
            id: user.id,
            email: user.email
          });
        } else {
          res.send('Error while adding user to db');
        }
      } catch (error) {
        res.send(error);
      }
    }
  })
  .all(rejectMethod);

module.exports = router;
