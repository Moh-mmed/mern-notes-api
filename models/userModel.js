const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide your username"],
    unique: true,
    trim: true,
    maxlength: [20, "Username must have less or equal to 20 characters"],
    minlength: [3, "Username must have greater or equal to 3 characters"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 4,
    select: false, //! To not be selected when querying
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    minlength: 4,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  roles: [
    {
      type: String,
      default: ["Employee"],
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
});


//? PASSWORD ENCRYPTION
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

//? Checking password by instant method
userSchema.methods.correctPassword = async (candidatePassword, userPassword) =>
  await bcrypt.compare(candidatePassword, userPassword);

const User = mongoose.model("User", userSchema);

module.exports = User;

