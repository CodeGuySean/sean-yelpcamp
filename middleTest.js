const isLoggedModule = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        // console.log(req.session.returnTo);
        req.flash("error", "You must be signed in");
        return res.redirect("/login");
    }
    next();
}

module.exports = isLoggedModule;
console.log(module);