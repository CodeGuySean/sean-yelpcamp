const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isAuthorOfReview } = require("../middleware");

const Review = require("../models/review");
const reviews = require("../controllers/reviews");


router.delete("/:reviewId", isLoggedIn, isAuthorOfReview, catchAsync(reviews.deleteReview));

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

module.exports = router;