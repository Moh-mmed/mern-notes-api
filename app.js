const express = require('express')
const path = require('path')
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require('./config/corsOptions')
const {logger}  = require('./middleware/logger')
const globalErrorHandler = require("./controllers/errorController");
const viewRouter = require('./routes/viewRouter')
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const noteRouter = require("./routes/noteRoutes");
const AppError = require('./utils/appError');

const app = express()

//* Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));


//* Config CORS (allow only some specific origin to send requests to this RestFULL API)
app.use(cors(corsOptions));
//! Should not accept request from all origins
// app.options("*", cors());


//* Development logging
if (process.env.NODE_ENV === 'development') {
    // app.use(logger);
  app.use(morgan('dev'));
}

//* Limit request from same IP
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);





//* Rendering views
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));



//* Receive and parse JSON data
app.use(express.json({ limit: "10kb" }));


//* COOKIE Parser
app.use(cookieParser());

//* Routes
app.use("/", viewRouter);
app.use('/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/notes', noteRouter)


app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);
module.exports = app