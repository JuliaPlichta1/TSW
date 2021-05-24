require("dotenv").config();
const port = process.env.PORT || 5000;

module.exports = {
    devServer: {
        proxy: `http://localhost:${port}`
    }
};