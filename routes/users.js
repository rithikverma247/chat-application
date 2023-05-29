var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/WhatsApp");

var userSchema = mongoose.Schema(
  {
    photo: String,
    username: String,
    email: String,
    password: String,
    is_online: {
      type: String,
      default: `0`,
    },
  },
  {
    timestams: true,
  }
);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
