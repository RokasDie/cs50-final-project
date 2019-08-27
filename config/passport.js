const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
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

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Check user in database
      db.get(
        "SELECT * FROM users WHERE email = $email",
        {
          $email: email
        },
        (err, rows) => {
          if (err) throw err;
          //   check if email was found
          if (!rows) {
            return done(null, false, {
              message: "That email is not registered"
            });
          }
          bcrypt.compare(password, rows["password"], (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, rows);
            } else {
              done(null, false, { message: "Password incorrect" });
            }
          });
        }
      );
    })
  );
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    db.get(
      "SELECT * FROM users WHERE id = $id",
      {
        $id: id
      },
      (err, rows) => {
        if (err) throw err;
        done(err, rows);
      }
    );
  });
};
