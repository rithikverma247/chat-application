var express = require("express");
var router = express.Router();
const path = require("path");
const multer = require("multer");
const passport = require("passport");
var userModel = require("./users");
const localStrategy = require("passport-local");
var chatModel = require("./chats");
const crypto = require("crypto");
const bodyParser = require("body-parser");
passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(13, function (arr, buff) {
      const fn = buff.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("photo"), function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (loggedInUser) {
      loggedInUser.photo = req.file.filename;
      loggedInUser.save().then(function () {
        res.redirect("/profile");
      });
    });
});

router.post("/savechat", async function (req, res, next) {
  var Chat = new chatModel({
    sender_id: req.body.sender_id,
    reciever_id: req.body.reciever_id,
    message: req.body.message,
  });
  var newChat = await Chat.save();
  res.status(200).send({ success: true, msg: "Chat Inserted!", data: newChat });
});

router.get("/profile", isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (user) {
      userModel.find({ _id: { $nin: [user._id] } }).then(function (allUser) {
        res.render("profile", { user, allUser });
      });
    });
});

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/register", function (req, res, next) {
  var newUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    photo: req.body.photo,
  });
  userModel
    .register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(function (e) {
      res.send(e);
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    // failureRedirect: '/loginfail'
    failWithError: true,
  }),
  function (err, req, res, next) {
    return res.redirect("/login");
  }
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
