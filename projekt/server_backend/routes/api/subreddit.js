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
          result = await pool.query('SELECT * FROM subreddit WHERE name ILIKE $1', [`%${req.query.q}%`]);
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
      const select = 'SELECT s.*, p.*, u.nickname FROM subreddit s ' +
        'JOIN post p ON p.subreddit_id = s.id JOIN reddit_user u ON p.user_id = u.id WHERE s.name = $1';
      const result = await pool.query(select, [req.params.subreddit]);
      const posts = result.rows;
      res.status(200).send(posts);
    } catch (error) {
      res.status(500).send(`Error with database: ${error.message}`);
    }
  })
  .all(rejectMethod);

module.exports = router;
