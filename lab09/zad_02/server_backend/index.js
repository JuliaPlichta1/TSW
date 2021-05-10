const express = require('express');
const cors = require('cors');

const app = express();
app.use(express());
app.use(cors());

app.get('/', async (req, res) => {
    res.send('succes');
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});