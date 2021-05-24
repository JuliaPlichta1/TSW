const express = require('express');
const cors = require('cors');

const app = express();
app.use(express());
app.use(express.json());
app.use(cors());

app.get('/todolist', async (req, res) => {
    const selectTodolist = "SELECT * FROM todolist ORDER BY id";
    try {
        const response = await client.query(selectTodolist);
        return res.send(response.rows);
    } catch (exception) {
        return res.status(404).send(exception);
    }
});

app.post("/todoElement", async (req, res) => {
    const todoElement = req.body;
    const insertTodoElement = "INSERT INTO public.todolist(title, finished) "
    + "VALUES ($1, $2) RETURNING *;";
    try {
        const result = await client.query(insertTodoElement, [todoElement.title, todoElement.finished]);
        return res.status(200).send(result.rows[0]);
    } catch (exception) {
        return res.status(404).send(exception);
    }
});

app.put("/todoElement/:id", async (req, res) => {
    const todoElement = req.body;
    const updateTodoElement = "UPDATE todolist SET title = ($1), finished = ($2) WHERE id = ($3) RETURNING *;";
    try {
        const result = await client.query(updateTodoElement, [todoElement.title, todoElement.finished, req.params.id]);
        if (result.rows.length) {
            return res.status(200).send(result.rows[0]);
        } else {
            return res.status(404).send("There's no todo element with this id");
        }
    } catch (exception) {
        return res.status(404).send(exception);
    }
});

app.patch("/todoElement/:id", async (req, res) => {
    const todoElement = req.body;
    const toggleTodoElement = "UPDATE todolist SET finished = not finished WHERE id = ($1) RETURNING *;";
    try {
        const result = await client.query(toggleTodoElement, [req.params.id]);
        if (result.rows.length) {
            return res.status(200).send(result.rows[0]);
        } else {
            return res.status(404).send("There's no todo element with this id");
        }
    } catch (exception) {
        return res.status(404).send(exception);
    }
});

app.delete("/todoElement/:id", async (req, res) => {
    const deleteTodoElement = "DELETE FROM todolist WHERE id = ($1) RETURNING *;";
    try {
        const result = await client.query(deleteTodoElement, [req.params.id]);
        if (result.rows.length) {
            return res.status(200).send(result.rows[0]);
        } else {
            return res.status(404).send("There's no todo element with this id");
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

const createTableToDoList = "CREATE TABLE IF NOT EXISTS todolist (id SERIAL, title VARCHAR NOT NULL, finished BOOLEAN NOT NULL)";

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
    try {
        await client.query(createTableToDoList);
    } catch (exception) {
        console.log(exception);
    }
  })
  .catch(err => console.error("Connection error", err.stack));
