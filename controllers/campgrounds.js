const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");


function getDifferentDays(nowDate, createDate) {
    const date1 = new Date(nowDate);
    const date2 = new Date(createDate);

    // console.log(`date1 = ${date1}`);
    // console.log(`date1 = ${date1.getTime()}`);
    // console.log(`date2 = ${date2}`);
    // console.log(`date2 = ${date2.getTime()}`);

    const oneDay = 1000 * 60 * 60 * 24;
    
    const differentTime = date1.getTime() - date2.getTime();
    // console.log(`date1 - date2 = ${differentTime}`);
    // console.log(`OneDay = ${oneDay}`)

    const differentDays = Math.round(differentTime / oneDay);
    // console.log(`differentTime / oneDay = ${differentTime / oneDay}`);
    // console.log(`differentDays = ${differentDays}`);

    if(differentDays == -1) {
        differentDays = 0;
    }

    return differentDays;
}

module.exports.index = async (req, res) => {
    // sort all the campground by descending order with createdAt date
    const campgrounds = await Campground.find({}).sort({createdAt:-1});
    res.render("campgrounds/index", { campgrounds, getDifferentDays });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    req.files.map(f => ({ url: f.path, filename: f.filename }));
    const newCampground = new Campground(req.body.campground);
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash("success", "Successfully made a new campground!");
    //console.log(newCampground);
    res.redirect(`/campgrounds/${newCampground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const showCampground = await Campground.findById(id)
    .populate({ path: "reviews",    //this is to populate the reviews in campground
        populate: {                 // then also populate each author in reviews
            path: "author"
        }
    }).populate("author");         // then also populate the author in campground
    // console.log(showCampground);
    if(!showCampground) {
        req.flash("error", "No such campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { showCampground, getDifferentDays });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render("campgrounds/edit", { foundCampground })
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const foundCampground = await Campground.findByIdAndUpdate(id, req.body.campground);
    //  save new added images into variable
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    //  then push the images parameter into the images array, so not saving a array into a array
    foundCampground.images.push(...imgs);
    await foundCampground.save();
    if(req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await foundCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}});
        // console.log(foundCampground);
    }
    req.flash("success", "Successfully Edit a campground!");
    res.redirect(`/campgrounds/${foundCampground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deleteCampground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully Deleted a campground!");
    res.redirect("/campgrounds")
}

