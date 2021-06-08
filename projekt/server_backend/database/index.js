const { Pool } = require('pg');
require('dotenv').config();

const dbConnData = {
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT || 5432,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD
};

const pool = new Pool(dbConnData);

module.exports = { pool };
