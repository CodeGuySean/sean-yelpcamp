const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
// const isLoggedIn = require("../middleware").isLoggedIn;

const multer = require('multer');
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");

//  Restructure the routes

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))
    

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// router.get("/", catchAsync(campgrounds.index));

// router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// router.get("/:id", catchAsync(campgrounds.showCampground));

// router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground));

// router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));



module.exports = router;