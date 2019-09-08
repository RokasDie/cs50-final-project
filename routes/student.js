var express = require("express");
var router = express.Router();
var sqlite3 = require("sqlite3").verbose();
var multer = require("multer");
var upload = multer();
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

router.get("/", ensureAuthenticated("student"), (req, res, next) => {
  db.all("SELECT * FROM homeworks", (err, rows) => {
    if (err) throw err;
    res.render("studentDashboard", { homeworks: rows });
  });
});

router.get(
  "/studentSubmission/:id",
  ensureAuthenticated("student"),
  (req, res, next) => {
    db.get(
      "SELECT review, grade, filename, name, description, subtitle FROM homeworks INNER JOIN studentSubmissions ON homeworks.id = studentSubmissions.homeworkId WHERE homeworks.id = $id AND studentSubmissions.studentId = $studentId",
      { $id: req.params.id, $studentId: req.user.id },
      (err, rows) => {
        console.log(rows);
        if (err) throw err;
        if (rows) {
          res.render("studentSubmission", { homeworks: rows });
        } else {
          console.log("sudas");
          db.get(
            "SELECT * from homeworks WHERE homeworks.id = $id",
            { $id: req.params.id },
            (err, rows2) => {
              if (err) throw err;
              res.render("studentSubmission", { homework: rows2 });
            }
          );
        }
      }
    );
  }
);

router.post(
  "/studentSubmission/:id",
  ensureAuthenticated("student"),
  upload.single("file"),
  (req, res, next) => {
    console.log(req.file);
    if (!req.file) {
      console.log("No file received");
      message = "Error! in image upload.";
      res.render("studentSubmission", { message: message, status: "danger" });
    } else {
      db.run(
        "INSERT INTO studentSubmissions (fileName, file, homeworkId, studentId) VALUES ($fileName, $file, $homeworkId, $studentId)",
        {
          $fileName: req.file.originalname,
          $file: req.file.buffer,
          $homeworkId: req.params.id,
          $studentId: req.user.id
        },
        (err, rows) => {
          if (err) throw err;
          req.flash("success_msg", "Homework submitted");
          res.redirect("/");
        }
      );
    }
  }
);

module.exports = router;
