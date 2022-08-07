const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
// const { application } = require("express");
// const { isLoggedIn } = require("../middleware");

//  Restructure the routes
router.route("/register")
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register))


router.route("/login")
    .get(users.renderLoginForm)
    .post(passport.authenticate("local", {failureFlash: true, failureRedirect: "/login", keepSessionInfo: true}), users.login)


router.get("/logout", users.logout);


// router.get("/register", users.renderRegisterForm);

// router.post("/register", catchAsync(users.register));

// router.get("/login", users.renderLoginForm);

// router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login", keepSessionInfo: true}), users.login);



module.exports = router;