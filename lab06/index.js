const express = require("express");
const app = express();
app.use(express.json());

app.get("/movies", async (req, res) => {
  const selectMovies = "select * from movie";
  try {
    const response = await client.query(selectMovies);
    return res.send(response.rows);
  } catch (exception) {
    return res.status(404).send(exception);
  }
});

app.post("/movies", async (req, res) => {
  const movie = req.body;
  const insertMovie = "INSERT INTO public.movie(name, genre, releaseyear) "
  + "VALUES ($1, $2, $3) RETURNING *;";
  
  try {
    const result = await client.query(insertMovie, [movie.name, movie.genre, movie.releaseyear]);
    return res.status(200).send(result.rows[0]);
  } catch (exception) {
    return res.status(404).send(exception);
  }
});

app.put("/movies/:id", async (req, res) => {
  const movie = req.body;
  const updateMovie = "UPDATE movie SET name = ($1), genre = ($2), releaseyear = ($3) WHERE id = ($4) RETURNING *;";

  try {
    const result = await client.query(updateMovie, [movie.name, movie.genre, movie.releaseyear, req.params.id]);
    if (result.rows.length) {
      return res.status(200).send(result.rows[0]);
    } else {
      return res.status(404).send("There's no movie with this id");
    }
  } catch (exception) {
    return res.status(404).send(exception);
  }
});

app.get("/movies/:id", async (req, res) => {
  const selectMovie = "SELECT * FROM movie WHERE id = ($1);";

  try {
    const result = await client.query(selectMovie, [req.params.id]);
    if (result.rows.length) {
      return res.status(200).send(result.rows[0]);
    } else {
      return res.status(404).send("There's no movie with this id");
    }
  } catch (exception) {
    return res.status(404).send(exception);
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

const createTableMovie = "CREATE TABLE IF NOT EXISTS movie (id SERIAL, name VARCHAR NOT NULL, genre VARCHAR NOT NULL, releaseYear INT NOT NULL)";

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
  .then(async () => {
    await client.query(createTableMovie);
  })
  .catch(err => console.error("Connection error", err.stack));
