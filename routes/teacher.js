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

// Render dashboard and load all teacher created Homeworks
router.get("/", ensureAuthenticated, function(req, res, next) {
  db.all(
    "SELECT * FROM homeworks WHERE teacherId = $teacherId",
    {
      $teacherId: req.user.id
    },
    (err, rows) => {
      // console.log(rows);
      if (err) throw err;
      res.render("teacherDashboard", { title: "Dashboard", homeworks: rows });
    }
  );
});

// Homework creation form page
router.get("/createHomework", ensureAuthenticated, function(req, res, next) {
  res.render("createHomework", { title: "Homework creation" });
});

// Post created Homework to database
router.post("/createHomework", ensureAuthenticated, (req, res, next) => {
  console.log(req.body);
  db.run(
    "INSERT INTO homeworks (name, description, subtitle, teacherId) VALUES ($name, $description, $subtitle, $teacherId)",
    {
      $name: req.body.name,
      $description: req.body.description,
      $subtitle: req.body.subtitle,
      $teacherId: req.user.id
    },
    (err, rows) => {
      if (err) throw err;
      res.redirect("/teacher/");
    }
  );
});

// will need to include to show submissions
// Homework submissions window
router.get("/homework/:id", ensureAuthenticated, (req, res, next) => {
  db.get(
    "SELECT * FROM homeworks WHERE id = $id",
    { $id: req.params.id },
    (err, rows) => {
      if (err) throw err;
      res.render("homework", { homework: rows });
    }
  );
});

module.exports = router;
