const express = require('express');
const { pool } = require('../../database');
const router = express.Router();
const bcrypt = require('../../bcrypt');

const { isAuth, rejectMethod } = require('../index');

router.route('/changePassword')
  .patch(isAuth, async(req, res) => {
    if (req.body.oldPassword === undefined || req.body.newPassword === undefined ||
      req.body.oldPassword === '' || req.body.newPassword === '' || req.body.newPassword !== req.body.newPasswordConfirm) {
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
        res.status(500).send(`Error with database: ${error}`);
      }
    }
  })
  .all(rejectMethod);

router.route('/subreddits')
  .get(isAuth, async(req, res) => {
    try {
      const select = `SELECT s.* FROM subreddit_user su JOIN subreddit s
        ON su.subreddit_id = s.id WHERE su.user_id = ${req.user.id}`;
      const result = await pool.query(select);
      res.status(200).send(result.rows);
    } catch (error) {
      res.status(500).send(`Error with database: ${error}`);
    }
  })
  .all(rejectMethod);

router.route('/moderatedSubreddits')
  .get(isAuth, async(req, res) => {
    try {
      const select = `SELECT s.* FROM subreddit_moderator sm 
        JOIN subreddit s ON sm.subreddit_id = s.id WHERE sm.user_id = ${req.user.id}`;
      const result = await pool.query(select);
      res.status(200).send(result.rows);
    } catch (error) {
      res.status(500).send(`Error with database: ${error}`);
    }
  })
  .all(rejectMethod);

router.route('/join/:subreddit')
  .post(isAuth, async(req, res) => {
    try {
      const select = 'SELECT * FROM subreddit WHERE name = $1';
      const result = await pool.query(select, [req.params.subreddit]);
      if (result.rows.length > 0) {
        const subreddit = result.rows[0];
        const select = 'SELECT * FROM subreddit_user WHERE subreddit_id = $1 AND user_id = $2';
        const result2 = await pool.query(select, [subreddit.id, req.user.id]);
        if (result2.rows.length > 0) {
          res.status(400).send('User has already joined subreddit');
        } else {
          const insert = 'INSERT INTO subreddit_user (user_id, subreddit_id) VALUES ($1, $2)';
          await pool.query(insert, [req.user.id, subreddit.id]);
          res.status(200).send('Successfully joined to subreddit');
        }
      } else {
        res.status(400).send('There is no subreddit with this name');
      }
    } catch (error) {
      res.status(500).send(`Error with database: ${error}`);
    }
  })
  .all(rejectMethod);

router.route('/leave/:subreddit')
  .delete(isAuth, async(req, res) => {
    try {
      const select = 'SELECT * FROM subreddit WHERE name = $1';
      const result = await pool.query(select, [req.params.subreddit]);
      if (result.rows.length > 0) {
        const subreddit = result.rows[0];
        const select = 'SELECT * FROM subreddit_user WHERE subreddit_id = $1 AND user_id = $2';
        const result2 = await pool.query(select, [subreddit.id, req.user.id]);
        if (result2.rows.length > 0) {
          const select = 'SELECT * FROM subreddit_moderator WHERE subreddit_id = $1 AND user_id = $2';
          const result3 = await pool.query(select, [subreddit.id, req.user.id]);
          if (result3.rows.length === 0) {
            const DELETE = 'DELETE FROM subreddit_user WHERE subreddit_id = $1 AND user_id = $2';
            await pool.query(DELETE, [subreddit.id, req.user.id]);
            res.status(200).send('Successfully left subreddit');
          } else {
            res.status(400).send('User is a moderator of the subreddit and cannot leave');
          }
        } else {
          res.status(400).send('User is not in the subreddit');
        }
      } else {
        res.status(400).send('There is no subreddit with this name');
      }
    } catch (error) {
      res.status(500).send(`Error with database: ${error}`);
    }
  })
  .all(rejectMethod);

module.exports = router;
