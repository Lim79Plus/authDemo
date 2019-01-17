//=================
// REQUIREMENT
//=================
var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    cookieParser = require("cookie-parser"),
    flash = require("connect-flash"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")

//=================
// MODELS
//=================
var User = require("./models/user");

//=================
// MONGO DB
//=================
mongoose.connect("mongodb://localhost/auth_demo_app", { useNewUrlParser: true });

//=================
// APP CONFIG
//=================
var app = express();
app.set("view engine", "ejs");
// set for form post
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
// **this code must be written before passport.initialize
app.use(require("express-session")({
    secret: "secret key",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//=================
// PASSPORT SETTING
//=================
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//=================
// ROUTE PATH
//=================
app.get("/", function (req, res) {
    res.render("home");
});

app.get("/secret", isLoggedIn, function (req, res) {
    res.render("secret");
});

// show sign up form
app.get("/register", function (req, res) {
    res.render("register");
})

// handling user sign up
app.post("/register", function (req, res) {
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                res.render("register");
            }
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secret");
            })

        });
});

// LOGIN ROUTE
app.get("/login", function (req, res) {
    res.render("login");
});

// LOGIN ROUTE FOR LOGIN LOGIC
app.post("/login", passport.authenticate('local', {
    failureRedirect: "/login",
    failureFlash: true
}), function (req, res) {
    console.log("login succeeded");
    res.redirect('/secret');
});

// LOGOUT ROUTE
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

//=================
// METHOD
//=================
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("this user was authenticated");
        return next();
    }
    console.log("not authenticated");
    res.redirect("/login");
}

// SERVER START UP
app.listen(3000, function () {
    console.log("node app server start up.");
});



