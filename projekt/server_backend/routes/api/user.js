const express = require('express');
const { pool } = require('../../database');
const router = express.Router();
const bcrypt = require('../../bcrypt');

const { isAuth, rejectMethod } = require('../index');

router.route('/changePassword')
  .patch(isAuth, async(req, res) => {
    if (req.body.oldPassword === undefined || req.body.newPassword === undefined || req.body.newPassword !== req.body.newPasswordConfirm) {
      res.status(400).send('Fields cannot be empty and new passwords must be equal');
    } else {
      try {
        const result = await pool.query('SELECT * FROM reddit_user WHERE id = ($1)', [req.user.id]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          if (bcrypt.compare(req.body.oldPassword, user.password)) {
            const hashedPassword = bcrypt.hash(req.body.newPassword);
            const updatePassword = 'UPDATE reddit_user SET password = $1 WHERE id = $2 RETURNING *';
            const result = await pool.query(updatePassword, [hashedPassword, req.user.id]);
            if (result.rows.length > 0) {
              res.status(200).send('Updated successfully');
            } else {
              res.status(500).send('Error while updating user password');
            }
          } else {
            res.status(400).send('Incorrect current password');
          }
        } else {
          res.status(500).send('Cannot find user in database');
        }
      } catch (error) {
        res.status(500).send(`Error with database: ${error.code}`);
      }
    }
  })
  .all(rejectMethod);

module.exports = router;
