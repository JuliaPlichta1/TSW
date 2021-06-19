require('dotenv').config();
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;
const clientPort = process.env.CLIENT_PORT || 8080;

module.exports = {
  devServer: {
    port: clientPort,
    proxy: `http://${host}:${port}`
  }
};
