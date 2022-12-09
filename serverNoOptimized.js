const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const app = express();
// Usamos knex para hacer la conexion con la base de datos en PostgreSQL;
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "adaneitor1998",
    database: "smart-brain",
  },
});

// db.select("*")
//   .from("users")
//   .then((data) => {
//     console.log(data);
//   });

// Cuando mandamos data desde el front end y esta utiliza el formato JSON necesitamos parsearlo
// porque express no sabe que es lo que estamos mandando, eso lo hacemos con app.use(express.json())
// esto es un middleware
app.use(express.json());
app.use(cors());

// const database = {
//   users: [
//     {
//       id: 1,
//       name: "John",
//       email: "john@gmail.com",
//       password: "cookies",
//       entries: 0,
//       joined: new Date(),
//     },
//     {
//       id: 2,
//       name: "Sally",
//       email: "sally@gmail.com",
//       password: "bananas",
//       entries: 0,
//       joined: new Date(),
//     },
//   ],
// };
// Get Users ---------------------------------------------------------
// app.get("/", (req, res) => {
//   res.json(database.users);
// });

// Login in ---------------------------------------------------------
app.post("/signin", (req, res) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) =>
            res.status(202).json({
              message: "User not found or incorrect password",
            })
          );
      } else
        res.status(202).json({
          message: "Wrong password",
        });
    })
    .catch((err) =>
      res.status(203).json({
        message: "Email not registered",
      })
    );

  // Codigo sin conexion a base de datos
  // const userValidation = database.users.find(
  //   (user) =>
  //     user.email === req.body.email && user.password === req.body.password
  // );
  // if (!userValidation)
  //   return res.status(202).json({
  //     message: "User not found or incorrect password",
  //   });
  // // let {}
  // res.json(userValidation);
});

// Register User -----------------------------------------------------
app.post("/register", (req, res) => {
  // console.log(req.body);
  const { email, name, password } = req.body;
  // const userEmailValidation = database.users.find(
  //   (user) => user.email === req.body.email
  // );
  // if (userEmailValidation)
  //   return res.status(202).json({
  //     message: "Email already registered",
  //   });
  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) =>
    res.status(202).json({
      message: "Email already registered",
    })
  );

  // database.users.push({
  //   id: database.users.length + 1,
  //   ...req.body,
  //   entries: 0,
  //   joined: new Date(),
  // });

  // console.log(database.users);
  // res.status(200).json(database.users[database.users.length - 1]);
  // res.json(database.users[database.users.length - 1]);
  // res.send("user register successfully");
});

// Get User ----------------------------------------------------------
app.get("/profile/:id", (req, res) => {
  // Con el siguiente comando buscamos y si existe retorna ese objeto
  // si no devuelve false
  // const userFound = database.users.find(
  //   (user) => user.id === parseInt(req.params.id)
  // );
  // Conexion a base de datos.
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
  // if (!userFound)
  //   return res.status(400).json({
  //     message: "User not found",
  //   });
  // res.json(userFound);
});

// Update Image Entries on user request ------------------------------
app.put("/image", (req, res) => {
  db("users")
    .where("id", "=", req.body.id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json("Unable to get entries"));
  // Version sin base de datos -----
  // const userFound = database.users.find((user) => user.id === req.body.id);
  // if (!userFound)
  //   return res.status(400).json({
  //     message: "User not found",
  //   });
  // userFound.entries++;
  // res.json(userFound.entries);
});

// Server Port Listening ---------------------------------------------
app.listen(8080, () => {
  console.log(`App running on http://localhost:${8080}`);
});

/* 
/ --> res = this is working
/signing --> POST = success / fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user
*/

// Bcrypt for passwords
// bcrypt.hash(req.body.password, null, null, function(err, hash) {
// console.log(hash);
// Store hash in your password DB.
// });

// // // Load hash from your password DB.
// bcrypt.compare(
//   "supersecret",
//   "$2a$10$StbH1NOaXNnzV2HhSuYOauNhIt7CCT9ghL9CF2za0UPKboH62t6em",
//   function (err, res) {
//     // res == true
//     console.log("First guess", res);
//   }
// );
// bcrypt.compare(
//   "veggies",
//   "$2a$10$A/M05sF.eJ9oxXr8QjIHJOkjwKZqGfgl192FmupLY9dlsKVyF29Di",
//   function (err, res) {
//     // res = false
//     console.log("Second guess", res);
//   }
// );
