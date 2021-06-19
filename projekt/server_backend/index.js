const express = require('express');
const cors = require('cors');

const app = express();

const clientHost = process.env.CLIENT_HOST || 'localhost';
const clientPort = process.env.CLIENT_PORT || 8080;
app.use(cors({
  credentials: true,
  origin: `http://${clientHost}:${clientPort}`
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const redisClient = redis.createClient();

redisClient.on('error', error => {
  console.log(`Error (redisClient): ${error}`);
});

redisClient.on('connect', () => {
  console.log('Redis client is ready');
});

const sessionStorage = new RedisStore({
  client: redisClient
});

const sessionMiddleware = session({
  secret: 'secretsecret',
  store: sessionStorage,
  resave: false,
  saveUninitialized: false
});

app.use(sessionMiddleware);
const passport = require('./passport/');
app.use(passport.initialize());
app.use(passport.session());

const auth = require('./routes/api/auth');
const user = require('./routes/api/user');
const subreddit = require('./routes/api/subreddit');
app.use('/api', auth);
app.use('/api/user', user);
app.use('/api/subreddit', subreddit);

app.get('/', (_req, res) => {
  res.status(200).send('OK');
});

const httpServer = require('http').createServer(app);

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;
httpServer.listen(port, () => {
  console.log(`API server listening at http://${host}:${port}`);
});
