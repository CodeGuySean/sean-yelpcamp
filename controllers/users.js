const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
}

module.exports.register = async (req, res, next) => {
    try {
        const {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Yeld Camp!");
            res.redirect("/campgrounds");
        })
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    // console.log(req.session);
    // console.log(req.originalUrl);
    // console.log(req.session.returnTo);
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout( (err) => {
        if(err) {
            return next(err);
        }
    });
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
}