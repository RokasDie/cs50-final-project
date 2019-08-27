var express = require("express");
var router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

/* GET home page. */
router.get("/", ensureAuthenticated, function(req, res, next) {
  res.render("index", { title: "Home" });
});

module.exports = router;
