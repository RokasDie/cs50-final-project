module.exports = {
  ensureAuthenticated: function(role) {
    return function(req, res, next) {
      // Ensure that user is logged in correctly
      if (!req.isAuthenticated()) {
        req.flash("error_msg", "Please log in to view this");
        return res.redirect("/users/login");
      }
      // Ensure that roles matches
      if (req.user.userType !== role) {
        req.flash("error_msg", "You are not authorized");
        return res.redirect("/");
      }
      return next();
    };
  }
};
