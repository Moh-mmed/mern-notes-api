const User = require("../models/userModel");
const Note = require("../models/noteModel");
const catchAsync = require("../utils/catchAsync");
const factory = require('./handlerFactory');
const AppError = require('../utils/appError')

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

exports.createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);

  //? Remove the password from the output
  user.password = undefined;
  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

//! DO NOT Update Passwords With This
exports.updateUser = catchAsync(async (req, res, next) => {

  // if (req.body.password || req.body.passwordConfirm) {
  //   return next(
  //     new AppError(
  //       "This route is not for password update, Please consider using /updatePassword.",
  //       400
  //     )
  //   );
  // }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body);
  // const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true,
  // });

  
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});


exports.deleteUser = catchAsync(async (req, res) => {
    const note = await Note.findOne({ user: req.params.id }).lean().exec();
    if (note) {
        return res
          .status(400)
          .json({ status: "fail", message: "User has assigned notes" });
    }

    await User.findByIdAndDelete(req.params.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
});