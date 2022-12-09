const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const app = express();
// Usamos knex para hacer la conexion con la base de datos en PostgreSQL;
const knex = require("knex");

const register = require("../controllers/register.js");
const signin = require("../controllers/signin.js");
const image = require("../controllers/image.js");
const {
  PORT,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} = require("./config.js");

const db = knex({
  client: "pg",
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
});

// Middlewares
app.use(express.json());
app.use(cors());

// Login in ---------------------------------------------------------
app.post("/signin", (req, res) => signin.handleSignin(req, res, db, bcrypt));

// Register User -----------------------------------------------------
app.post("/register", (req, res) =>
  register.handleRegister(req, res, db, bcrypt)
);

// Get User ----------------------------------------------------------
app.get("/profile/:id", (req, res) => {
  db.select("*")
    .from("users")
    .where({
      id: req.params.id,
    })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => res.status(400).json("Not found user"));
});

// Update Image Entries on user request ------------------------------
app.put("/image", (req, res) => image.handleImage(req, res, db));
app.post("/imageurl", (req, res) => image.handleApiCall(req, res));

// Server Port Listening ---------------------------------------------
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
