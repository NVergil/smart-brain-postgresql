const handleSignin = (req, res, db, bcrypt) => {
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
};

module.exports = {
  handleSignin,
};