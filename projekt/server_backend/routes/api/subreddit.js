const express = require('express');
const { pool } = require('../../database');
const router = express.Router();

const { _isAuth, rejectMethod } = require('../index');

router.route('/')
  .get(async(req, res) => {
    try {
      const result = await pool.query('SELECT * FROM subreddit');
      const subreddits = result.rows;
      res.status(200).send(subreddits);
    } catch (error) {
      res.status(500).send(`Error with database: ${error.message}`);
    }
  })
  .all(rejectMethod);

router.route('/search')
  .get(async(req, res) => {
    if (!req.query.q || !req.query.type) {
      res.status(400).send('Please input q and type params in query');
    } else {
      try {
        let result;
        if (req.query.type === 'subreddits') {
          const selectQuery = `SELECT s.*, count(su.id) members FROM subreddit_user su
            JOIN subreddit s ON su.subreddit_id = s.id WHERE s.name ILIKE $1 GROUP BY s.id`;
          result = await pool.query(selectQuery, [`%${req.query.q}%`]);
        } else if (req.query.type === 'posts') {
          const select = 'SELECT s.*, p.*, u.nickname FROM subreddit s ' +
            'JOIN post p ON p.subreddit_id = s.id JOIN reddit_user u ON p.user_id = u.id ' +
            'WHERE content ILIKE $1 OR title ILIKE $1';
          result = await pool.query(select, [`%${req.query.q}%`]);
        } else {
          res.status(400).send('Type param can only be "subreddits" or "posts"');
          return;
        }
        res.status(200).send(result.rows);
      } catch (error) {
        res.status(500).send(`Error with database: ${error.message}`);
      }
    }
  })
  .all(rejectMethod);

router.route('/r/:subreddit')
  .get(async(req, res) => {
    try {
      let select = `SELECT s.*, count(su.id) members FROM subreddit_user su
        JOIN subreddit s ON su.subreddit_id = s.id WHERE s.name = $1 GROUP BY s.id`;
      const result = await pool.query(select, [req.params.subreddit]);
      if (result.rows.length > 0) {
        const subreddit = result.rows[0];
        select = `SELECT u.nickname FROM subreddit_moderator sm 
          JOIN reddit_user u ON sm.user_id = u.id JOIN subreddit s 
          ON sm.subreddit_id = s.id WHERE s.name = $1`;
        const result2 = await pool.query(select, [req.params.subreddit]);
        subreddit.moderators = result2.rows;
        select = 'SELECT p.*, u.nickname FROM subreddit s ' +
        'JOIN post p ON p.subreddit_id = s.id JOIN reddit_user u ON p.user_id = u.id WHERE s.name = $1';
        const result3 = await pool.query(select, [req.params.subreddit]);
        const posts = result3.rows;
        res.status(200).send({ subreddit, posts });
      } else {
        res.status(400).send('There is no subreddit with this name');
      }
    } catch (error) {
      res.status(500).send(`Error with database: ${error.message}`);
    }
  })
  .all(rejectMethod);

router.route('/r/:subreddit/comments/:postId')
  .get(async(req, res) => {
    try {
      let select = `SELECT s.*, count(su.id) members FROM subreddit_user su
        JOIN subreddit s ON su.subreddit_id = s.id WHERE s.name = $1 GROUP BY s.id`;
      const result = await pool.query(select, [req.params.subreddit]);
      if (result.rows.length > 0) {
        const subreddit = result.rows[0];
        select = `SELECT u.id, u.nickname FROM subreddit_moderator sm 
          JOIN reddit_user u ON sm.user_id = u.id JOIN subreddit s 
          ON sm.subreddit_id = s.id WHERE s.id = $1`;
        const result2 = await pool.query(select, [subreddit.id]);
        subreddit.moderators = result2.rows;
        select = `SELECT p.*, u.nickname FROM post p 
          JOIN reddit_user u ON p.user_id = u.id 
          JOIN subreddit s ON p.subreddit_id = s.id WHERE p.id = $1 AND s.id = $2`;
        const result3 = await pool.query(select, [req.params.postId, subreddit.id]);
        if (result3.rows.length > 0) {
          const post = result3.rows[0];
          select = `SELECT c.*, u.nickname FROM public.comment c
            JOIN reddit_user u ON c.user_id = u.id
            JOIN post p ON c.post_id = p.id
            JOIN subreddit s ON p.subreddit_id = s.id WHERE s.name = $1 AND p.id = $2`;
          const result4 = await pool.query(select, [req.params.subreddit, req.params.postId]);
          const comments = result4.rows;
          res.status(200).send({ subreddit, post, comments });
        } else {
          res.status(400).send('There is no post with this id in this subreddit');
        }
      } else {
        res.status(400).send('There is no subreddit with this name');
      }
    } catch (error) {
      res.status(500).send(`Error with database: ${error.message}`);
    }
  })
  .all(rejectMethod);

module.exports = router;
