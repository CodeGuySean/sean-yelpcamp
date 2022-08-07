if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const mongoSanitize = require('express-mongo-sanitize');
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const Joi = require("joi");
// const { campgroundSchema, reviewSchema } = require("./schema.js");
// const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
// const Campground = require("./models/campground");
// const Review = require("./models/review");
const { nextTick } = require("process");
// const AppError = require("./AppError");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");


const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const testRoutes = require("./routes/test");

const MongoDBStore = require("connect-mongo");

// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yeld-camp"

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=> {
    console.log("Database connected");
});

const app = express();

//  configuration for app
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

//  middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET || "thisshouldbebettersecret!"

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/"
];

const styleSrcUrls = [
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/"
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://images.unsplash.com/",
            "https://res.cloudinary.com/",
        ]
    }
    }
));

//  session must be before the passport.session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session);
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

// app.get("/fakeUser", async (req, res) => {
//     const user = new User({email: "test@gmail.com", username: "test"});
//     const newUser = await User.register(user, "test1234")
//     res.send(newUser);
// })

const verifyPassword = (req, res, next) => {
    const { password } = req.query;
    if(password === "1205") {
        next();
    }
    // it will throw a special error handling which named AppError to the default error handler
    throw new AppError("Password required!", 401);
    // res.send("Wrong Password!");
    // res.status(401);
}

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.use("/", testRoutes);

app.get("/", (req, res) => {
    res.render("home");
})

app.get("/secret", verifyPassword, (req, res) => {
    res.render("home");
})

app.get("/testerror", (req, res) => {
    chickenfly();
})

// app.get("/campgrounds", catchAsync(async (req, res) => {
//     const campgrounds = await Campground.find({});
//     res.render("campgrounds/index", { campgrounds });
// }))

// app.get("/campgrounds/new", (req, res) => {
//     res.render("campgrounds/new");
// })

// app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
//     //if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
//     const newCampground = new Campground(req.body.campground);
//     await newCampground.save();
//     //console.log(newCampground);
//     res.redirect(`/campgrounds/${newCampground._id}`);
// }))

// app.get("/campgrounds/:id", async (req, res) => {
//     const { id } = req.params;
//     const showCampground = await Campground.findById(id).populate("reviews");
//     res.render("campgrounds/show", { showCampground });
// })

// app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const foundCampground = await Campground.findById(id);
//     res.render("campgrounds/edit", { foundCampground })
// }))

// app.put("/campgrounds/:id", catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const foundCampground = await Campground.findByIdAndUpdate(id, req.body.campground);
//     res.redirect(`/campgrounds/${foundCampground._id}`)
// }))

// app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
//     await Review.findByIdAndDelete(reviewId);
//     // const { id } = req.params;
//     // const deleteReview = await Campground.findById(id);
//     res.redirect(`/campgrounds/${id}`);
// }))

// app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const deleteCampground = await Campground.findByIdAndDelete(id);
//     res.redirect("/campgrounds")
// }))

// app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
// }))



app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})

// app.get("/makecampground", async (req, res) => {
//     const camp = new Campground({ title: "My Backyard", description: "cheap camping!"});
//     await camp.save();
//     res.send(camp);
// })

//  it use to catch error of any page is not found, eg. /abc, /cde
app.use((req, res) => {
    res.status(404).send("NOT FOUND!");
})

//  it use to catch generic error, but there is AppError exist, 
//   so will pass AppError's handling(status and message, etc) to here
app.use((err, req, res, next) => {
    const { status = 500, message = "Something is wrong" } = err;
    res.status(status).render("error", { err });
})

app.listen(3000, ()=> {
    console.log("Serving on port 3000")
})

