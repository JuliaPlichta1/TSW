const express = require('express');
const { pool } = require('../../database');
const router = express.Router();

const { isAuth, rejectMethod } = require('../index');
const { upload } = require('../../multer');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;

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

router.route('/create')
  .post(isAuth, async(req, res) => {
    if (req.body.name === undefined || req.body.description === undefined ||
      req.body.name === '' || req.body.description === '') {
      res.status(400).send('Fields cannot be empty');
    } else {
      const client = await pool.connect();
      try {
        let result = await client.query('SELECT * FROM subreddit WHERE name = ($1)', [req.body.name]);
        if (result.rows.length > 0) {
          res.status(409).send('There is already a subreddit with this name');
        } else {
          await client.query('BEGIN');
          let insert = 'INSERT INTO subreddit(name, description) VALUES ($1, $2) RETURNING *';
          result = await client.query(insert, [req.body.name, req.body.description]);
          const subreddit = result.rows[0];
          insert = 'INSERT INTO subreddit_user(user_id, subreddit_id) VALUES ($1, $2)';
          await client.query(insert, [req.user.id, subreddit.id]);
          insert = 'INSERT INTO subreddit_moderator(user_id, subreddit_id) VALUES ($1, $2)';
          await client.query(insert, [req.user.id, subreddit.id]);
          await client.query('COMMIT');
          res.status(201).send(subreddit);
        }
      } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).send('Error while adding user to db');
      } finally {
        client.release();
      }
    }
  })
  .all(rejectMethod);

const formatedTimestamp = () => {
  const d = new Date();
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().split(' ')[0];
  return `${date} ${time}`;
};

router.route('/r/:subreddit/post')
  .post(isAuth, upload.single('image-file'), async(req, res) => {
    if (req.body.title === undefined || req.body.title === '') {
      res.status(400).send('Field "title" cannot be empty');
    } else {
      try {
        const select = 'SELECT * FROM subreddit WHERE name = $1';
        const result = await pool.query(select, [req.params.subreddit]);
        if (result.rows.length > 0) {
          const subreddit = result.rows[0];
          let imagePath = null;
          if (req.file) {
            if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/gif' ||
            req.file.mimetype === 'image/png') {
              imagePath = `http://${host}:${port}/uploads/${req.file.filename}`;
            } else {
              throw TypeError('Incorrect file type');
            }
          }
          const creationDate = formatedTimestamp();
          const insert = `INSERT INTO post(title, content, image_path, video_url, creation_date,
            subreddit_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
          const values = [req.body.title, req.body.content, imagePath,
            req.body.video_url, creationDate, subreddit.id, req.user.id];
          const result2 = await pool.query(insert, values);
          if (result2.rows.length > 0) {
            const post = result2.rows[0];
            res.status(200).send(post);
          } else {
            res.status(500).send('Error while adding post to db');
          }
        } else {
          res.status(400).send('There is no subreddit with this name');
        }
      } catch (error) {
        if (error.message === 'Incorrect file type') {
          res.status(400).send(error.message);
        } else {
          res.status(500).send(`Error with database: ${error.message}`);
        }
      }
    }
    // console.log(JSON.stringify(req.body));
    // console.log(JSON.stringify(req.file));
    // if (req.file) {
    //   const _imagePath = `http://${host}:${port}/uploads/${req.file.filename}`;
    // }
    // res.status(201).send({ body: req.body, file: req.file });
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
