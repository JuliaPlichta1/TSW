require("dotenv").config();
const port = process.env.PORT || 5000;
const clientPort = process.env.CLIENT_PORT || 8080;

module.exports = {
    devServer: {
        port: clientPort,
        proxy: `http://localhost:${port}`
    }
};