const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
// const helmet = require('helmet');
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const globalErrorHandler = require("./controllers/errorController");
const cvRouter = require("./routes/cvRoutes");
const userRouter = require("./routes/userRoutes");
const viewRouter = require("./routes/viewRoutes");
const commonRouter = require("./routes/commonRoutes");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");
const landingRouter = require("./routes/landingConfigRoutes");
const projectRouter = require("./routes/projectRoutes");

const AppError = require("./utils/appError");
const { sendMessage } = require("./controllers/messageController");

// Start express app
const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views")); //node function will create automatically correct path

//Development logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//Limit requests from same IP
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.protocol === "http") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }

    next();
  });
}

app.use("/api", limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: "20mb" })); //middleware for post data. body larger than 10mb will not be accepted

app.use(express.urlencoded({ extended: true, limit: "10mb" })); //parse form data urlencoded

app.use(cookieParser()); //parse data from cookies

//Data sanitization against NoSQL query injection
app.use(mongoSanitize()); //will filter out all the dollar signs and double dots

//Data sanitization against XSS
app.use(xss()); //clean user input from malicious html code

// app.use(cors()); // Will add a couple of different headers to our response // Access-Control-Allow-Origin: *
// app.use(
//   cors({
//     origin: 'https://www.natours.com',
//   })
// );
// app.options('*', cors()); //hyyp method. like app.get(), app.post(), app.patch()

app.use(compression()); //compress all the text that's sent to clients

//Serving static files (css, etc)
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Route Handlers
// Whenever there's a request with a url that starts like this, then this middleware function will basically be called

app.use("/", viewRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/cv", cvRouter);
app.use("/api/v1/common", commonRouter);
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/landing", landingRouter);
app.use("/api/v1/projects", projectRouter);

// If we add a middleware here, it'll only be reached if not handled by any of our other routers
// all() for all the verbs, all the http methods
app.all("*", (req, res, next) => {
  next(
    new AppError(`No se encuentra ${req.originalUrl} en este servidor`, 404)
  );
});

//global error handling middleware (use next(error) para llegar aqui)
app.use(globalErrorHandler);

// SERVER
module.exports = app;
