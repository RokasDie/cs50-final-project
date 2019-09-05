var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(
  "teachingDatabase.db",
  sqlite3.OPEN_READWRITE,
  err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to the database.");
  }
);

/* GET users listing. */
router.get("/register", function(req, res, next) {
  res.render("register", { title: "Register" });
});

router.post("/register", (req, res, next) => {
  const { name, email, password, password2, userType } = req.body;

  let errors = [];

  // Check required fields

  if (!name || !email || !password || !password2 || !userType) {
    errors.push({ msg: "Please fill in all fields" });
  }
  // Check if passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords don't match" });
  }
  // check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    // validated
    // check if email is not taken
    db.get(
      "SELECT * FROM users WHERE email = $email",
      {
        $email: email
      },
      (err, rows) => {
        if (err) {
          return console.error(err.message);
        }
        if (rows) {
          errors.push({ msg: "Email is already used" });
          res.render("register", { errors, name, email, password, password2 });
        } else {
          // if email is not taken hash password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) {
                if (err) throw err;
              }
              // Save the user to database
              db.run(
                "INSERT INTO users (name, email, password, userType) VALUES ($name, $email, $password, $userType)",
                {
                  $name: req.body.name,
                  $email: req.body.email,
                  $password: hash,
                  $userType: req.body.userType
                },
                result => {
                  req.flash("success_msg", "You are now registered ");
                  // take user to index
                  res.redirect("/users/login");
                }
              );
            })
          );
        }
      }
    );
  }
});

// Login route

router.get("/login", function(req, res, next) {
  res.render("login", { title: "Login" });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
