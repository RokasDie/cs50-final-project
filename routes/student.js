var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
var sqlite3 = require("sqlite3").verbose();
const { ensureAuthenticated } = require("../config/auth");
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

router.get("/", ensureAuthenticated, (req, res, next) => {
  db.all("SELECT * FROM homeworks", (err, rows) => {
    if (err) throw err;
    res.render("studentDashboard", { homeworks: rows });
  });
});

router.get("/studentSubmission/:id", ensureAuthenticated, (req, res, next) => {
  db.get(
    "SELECT * FROM homeworks WHERE id = $id",
    { $id: req.params.id },
    (err, rows) => {
      if (err) throw err;
      res.render("studentSubmission", { homework: rows });
    }
  );
});

module.exports = router;
