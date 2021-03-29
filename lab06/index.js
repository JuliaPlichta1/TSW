const express = require("express");
const app = express();
app.use(express.json());

app.get("/movies", async (req, res) => {
  const selectMovies = "select * from movie";
  const response = await client.query(selectMovies);
  return res.send(response.rows);
});

app.post("/movies", async (req, res) => {
  const insertMovie = "INSERT INTO public.movie(name, genre, releaseyear) "
  + `VALUES ('${req.body.name}', '${req.body.genre}', ${req.body.releaseyear}) RETURNING id;`;
  
  try {
    const result = await client.query(insertMovie);
    return res.status(200).send(result.rows[0]);
  } catch {
    return res.status(404).send("error");
  }
});

require("dotenv").config();
const dbConnData = {
    host: process.env.PGHOST || "127.0.0.1",
    port: process.env.PGPORT || 5432,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD
};


const { Client } = require("pg");
const client = new Client(dbConnData);

console.log("Connection parameters: ");
console.log(dbConnData);
client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`API server listening at http://localhost:${port}`);
    });
  })
  .catch(err => console.error("Connection error", err.stack));
