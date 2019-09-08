const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
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
router.get("/", ensureAuthenticated("teacher"), function(req, res, next) {
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
router.get("/createHomework", ensureAuthenticated("teacher"), function(
  req,
  res,
  next
) {
  res.render("createHomework", { title: "Homework creation" });
});

// Post created Homework to database
router.post(
  "/createHomework",
  ensureAuthenticated("teacher"),
  (req, res, next) => {
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
        if (err) {
          let errors = [];
          // Check if homework name is unique, if error 19 it means its in use
          if (err["errno"] === 19) {
            errors.push({ msg: "Please create unique name for homework" });
          }
          res.render("createHomework", {
            errors,
            title: "Homework creation"
          });
          return;
        }
        res.redirect("/teacher/");
      }
    );
  }
);

router.get(
  "/homework/:id",
  ensureAuthenticated("teacher"),
  (req, res, next) => {
    db.all(
      `SELECT users.name, homeworks.description, homeworks.subtitle, studentSubmissions.id, studentSubmissions.fileName, studentSubmissions.review, studentSubmissions.grade FROM studentSubmissions INNER JOIN users ON studentSubmissions.studentId = users.id INNER JOIN homeworks
    ON studentsubmissions.homeworkId = homeworks.id WHERE studentSubmissions.homeworkId = $homeworkId`,
      { $homeworkId: req.params.id },
      (err, rows) => {
        if (err) throw err;
        console.log("teacher homework ", rows);

        console.log("sudas");
        db.get(
          "SELECT * FROM homeworks WHERE homeworks.id = $id",
          {
            $id: req.params.id
          },
          (err2, rows2) => {
            console.log(rows2);
            if (err2) throw err2;
            res.render("teacherHomework", {
              homeworks: rows2,
              submissions: rows
            });
          }
        );
      }
    );
  }
);

router.post("/homework/", ensureAuthenticated("teacher"), (req, res, next) => {
  console.log(req.body);
  db.run(
    req.body.updatedField === "review"
      ? "UPDATE studentSubmissions SET review= $value WHERE id = $id"
      : "UPDATE studentSubmissions SET grade= $value WHERE id = $id",
    {
      $value: req.body.value,
      $id: req.body.id
    },
    (err, rows) => {
      if (err) throw err;
      console.log("table updated");
    }
  );
});

router.get(
  "/homework/downloads/:id",
  ensureAuthenticated("teacher"),
  (req, res, next) => {
    console.log(req.params.id);
    db.get(
      "SELECT * FROM studentSubmissions WHERE id = $id",
      {
        $id: req.params.id
      },
      (err, rows) => {
        if (err) throw err;
        // console.log(rows);
        const fileBuffer = Buffer.from(rows["file"]);
        const fileName = rows["fileName"];

        const utf8FileName = encodeURIComponent(fileName);
        res.setHeader(
          "Content-Disposition",
          "attachment;filename*=UTF-8''" + utf8FileName
        );
        let writeStream = fs.createWriteStream(fileName);

        writeStream.write(fileBuffer);
        writeStream.on("finish", () => {
          console.log("wrote all data to file");
          console.log(fileName);

          console.log("sudas");
          fs.createReadStream(`./${fileName}`).pipe(res);
          // res.sendFile(path.join(__dirname, "../", rows["fileName"]));
          fs.unlink(`./${fileName}`, err => {
            if (err) throw err;
          });
        });
        writeStream.end();
      }
    );
  }
);

module.exports = router;
