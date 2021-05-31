const express = require('express');
const cors = require('cors');

const app = express();
app.use(express());
app.use(express.json());
app.use(cors());

const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const sessionMiddleware = session({ 
    secret: "SuperSecretPassword", 
    resave: false, 
    saveUninitialized: false 
});
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

const DUMMY_USER = {
    id: 1,
    username: "john"
};

passport.serializeUser((user, cb) => {
    console.log(`Passport: wywołujemy „serializeUser” dla user.id == ${user.id}`);
    cb(null, user.id);
  });
  
  passport.deserializeUser((id, cb) => {
    console.log(`Passport: wywołujemy „deserializeUser” dla id == ${id}`);
    cb(null, DUMMY_USER);
  });

passport.use(new LocalStrategy((username, password, done) => {
    if (username === 'john' && password === 'john123') {
        console.log("Authentication correct.");
        return done(null, DUMMY_USER);
    } else {
        console.log("Authentication failed. Wrong credential.");
        return done(null, false);
    }
}));

app.get('/user', (req, res) => {
    res.status(200).send({
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

app.post('/login', passport.authenticate("local"), (req, res) => {
    res.status(200).send({
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

app.get('/logout', (req, res) => {
    req.logout();
    res.status(200).send("logged out");
});

app.get('/todolist', async (_req, res) => {
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

const httpServer = require("http").createServer(app);

const clientPort = process.env.CLIENT_PORT || 8080;
const io = require("socket.io")(httpServer, {
    cors: {
        origin: `http://localhost:${clientPort}`,
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    socket.on("disconnection", () => {
        console.log(`Socket ${socket.id} disconnected`);
    });

    socket.on("addedTodoElement", (todoElement) => {
        console.log("Added TODO");
        console.log(todoElement);
        io.emit("todoElementAdded", todoElement);
    });

    socket.on("editedTodoElement", (todoElement) => {
        console.log("Edited TODO");
        console.log(todoElement);
        io.emit("todoElementEdited", todoElement);
    });

    socket.on("deletedTodoElement", (todoElement) => {
        console.log("Deleted TODO");
        console.log(todoElement);
        io.emit("todoElementDeleted", todoElement);
    });

    socket.on("toggledTodoElement", (todoElement) => {
        console.log("Toggled TODO");
        console.log(todoElement);
        io.emit("todoElementToggled", todoElement);
    });
})

require("dotenv").config();
const dbConnData = {
    host: process.env.PGHOST || "127.0.0.1",
    port: process.env.PGPORT || 5432,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD
};

const { Client } = require("pg");
const { lchownSync } = require('fs');
const client = new Client(dbConnData);

const createTableToDoList = "CREATE TABLE IF NOT EXISTS todolist (id SERIAL, title VARCHAR NOT NULL, finished BOOLEAN NOT NULL)";

console.log("Connection parameters: ");
console.log(dbConnData);
client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
    const port = process.env.PORT || 5000;
    httpServer.listen(port, () => {
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
