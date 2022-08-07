const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleTest");
// const isLoggedIn = require("../middleTest").isLoggedModule;

router.get("/test", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

console.log(isLoggedIn)
module.exports = router;