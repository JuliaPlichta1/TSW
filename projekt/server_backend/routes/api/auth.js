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
    if (req.body.username === undefined || req.body.email === undefined || req.body.password === undefined ||
      req.body.username === '' || req.body.email === '' || req.body.password === '' ||
      req.body.password !== req.body.confirmPassword) {
      res.status(400).send('Fields cannot be empty and passwords must be equal');
    } else {
      try {
        const result = await pool.query('SELECT * FROM reddit_user WHERE email = ($1)', [req.body.email]);
        if (result.rows.length > 0) {
          res.status(409).send('This email is already in use');
        } else {
          const result = await pool.query('SELECT * FROM reddit_user WHERE nickname = ($1)', [req.body.username]);
          if (result.rows.length > 0) {
            res.status(409).send('This username is already in use');
          } else {
            const hashedPassword = bcrypt.hash(req.body.password);
            const insertUser = 'INSERT INTO reddit_user (nickname, email, password) VALUES ($1, $2, $3) RETURNING *';
            const result = await pool.query(insertUser, [req.body.username, req.body.email, hashedPassword]);
            if (result.rows.length > 0) {
              const user = result.rows[0];
              res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email
              });
            } else {
              res.status(500).send('Error while adding user to db');
            }
          }
        }
      } catch (error) {
        res.status(500).send(`Error with database: ${error.message}`);
      }
    }
  })
  .all(rejectMethod);

module.exports = router;
