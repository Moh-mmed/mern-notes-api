const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

//! To generate JWT-secret: require('crypto').randomBytes(64).toString('hex') 

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

const createSendToken = (user, statusCode, req, res) => {
  //? jwt.sign(payload, secret, token expires token-header will be created automatically)
  const token = signToken(user._id);

  //? Send the JWT via COOKIES, (expose it to the client-side)
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + 60 + 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  //? Remove the password from the output
  user.password = undefined;

  //* Send also the token to the client
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};


exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  //? 1) Check if username and password exist
  if (!username || !password) {
    return next(new AppError("Please provide valid username and password!", 400));
  }

  //? 2) Check if user exists and password is correct
  const user = await User.findOne({ username: username }).select("+password");

  //? Compare the entered password with the one got from DB using bcrypt, BUT we create the correctPassword() in userModel
  const correct = user && (await user.correctPassword(password, user.password));

  //! We don't separate email and password checking to not give a hint to the hacker
  if (!user || !correct) {
    return next(new AppError("Incorrect username or password", 401));
  }
  //? 3) If everything is okay, send the token to client
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

//* Protection Middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token || token === 'null') {
    return next(new AppError("You are not logged in, please log in"));
  }

  //? 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //? 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError("The user belonging to this token is no longer exist.", 401)
    );


  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

//! This Middleware is only for rendering Pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //? 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //? 2) Check if user still exists
      const freshUser = await User.findById(decoded.id);

      if (!freshUser) return next();

      // THERE IS A LOGGED IN USER
      //* Each template in the FrontEnd has access to res.locals, so the user will be accessible
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

//* Authorization Middleware
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.some((role) => req.user.roles.includes(role))) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };


  