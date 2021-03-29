const { Client } = require("pg");

const client = new Client({
    user: "postgres",
    host: "localhost",
    password: "mysecretpassword"
});

client.connect();

const createTable = 
"CREATE TABLE Movie ( " +
"    Id SERIAL, " +
"    Name VARCHAR NOT NULL, " +
"    Genre VARCHAR NOT NULL, " +
"    ReleaseYear INT NOT NULL " +
")"

client.query(createTable, (err, res) => {
    console.log(err ? err.stack : res.rows[0]);
    client.end();
});