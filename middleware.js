const { campgroundSchema, reviewSchema } = require("./schema.js");
const Campground = require("./models/campground");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");

const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        // console.log(req.session.returnTo);
        req.flash("error", "You must be signed in");
        return res.redirect("/login");
    }
    next();
}

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    if( !foundCampground.author.equals(req.user._id) ) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const isAuthorOfReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const foundReview = await Review.findById(reviewId);
    if( !foundReview.author.equals(req.user._id) ) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// module.exports = {isLoggedIn};
module.exports.isLoggedIn = isLoggedIn;
module.exports.validateCampground = validateCampground;
module.exports.isAuthor = isAuthor;
module.exports.validateReview = validateReview;
module.exports.isAuthorOfReview = isAuthorOfReview;
