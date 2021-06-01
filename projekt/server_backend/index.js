const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).send('OK');
});

const httpServer = require('http').createServer(app);

const port = 5000;
httpServer.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
