const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/userModel");
const Cv = require("../models/cvModel");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, // only sent in https
    httpOnly: true, // Can not be accessed or modified in any way by the browser
  };
  const responseOptions = {
    status: "success",
    token,
  };
  if (process.env.NODE_ENV === "development") cookieOptions.secure = false;
  if (statusCode === 201) responseOptions.data = { user: user };
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json(responseOptions);
};

// It's gonna be an async function because we're gonna do somme database operations
// Signup handler
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    lastName: req.body.lastName,
    email: req.body.email,
    occupation: req.body.occupation,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  // const url = `${req.protocol}://${req.get('host')}/me`;
  // await new Email(newUser, url).sendWelcome(); // await because sendWelcome is an async function
  createAndSendToken(newUser, 201, res);
  // Send email
  const emailURL = `${req.protocol}://${req.get("host")}/completar-perfil`;
  await new Email(newUser, emailURL).sendWelcome();
  await new Email(
    {
      email: "hello@example.com",
      name: "",
    },
    ""
  ).sendNewUserNotification({
    nombre: req.body.name,
    apellido: req.body.lastName,
    occupation: req.body.occupation,
    email: req.body.email,
  });
  //
});

exports.createAdmin = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    lastName: req.body.lastName,
    role: "admin",
    photo: "favicon2x.png",
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  res.status(201).json({
    status: "success",
    data: {
      data: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Por favor inserta un email y contraseña", 400));
  }
  // Check if user exists && password correct
  const user = await User.findOne({ email: email }).select("+password"); // ES6 : ({ email }) //we need to explicity select we want the password because we did set select: false, in the userSchema

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Email o contraseña incorrectos", 401)); // More secure way from attackers. (more vague way of telling what's incorrect)
  }

  // If everything is ok, send token to client
  createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") // Autorization header, for the API
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    // Cookie, for the rendered website
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        "No has iniciado sesión. Por favor inicia sesión para tener acceso",
        401
      )
    );
  }
  // Verification token
  // This function is async, calls the callback function when verification completed. we'll promisify the function
  // jwt.verify(token, process.env.JWT_SECRET); // If this throws an error, we are handling that in the global error handling middleware errors: JsonWebTokenError, TokenExpiredError
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("El usuario perteneciente a este token no existe.", 401)
    );
  }
  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "El usuario recientemente cambión la contraseña! Por favor inicia sesión de nuevo",
        401
      )
    );
  }

  // Only then we go to the next handler, which grant access to protected route
  req.user = currentUser; // Might be useful in future // So we can use it in the next middleware function // If we want to pass data from middleware to middleware, then we can put that data in the request object
  res.locals.user = currentUser; // To be accesible inside a template // Each and every template will have access to res.locals
  next();
});

// Only for render pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // There is a logged in user
      req.user = currentUser;
      res.locals.user = currentUser; // To be accesible inside a template // Each and every template will have access to res.locals
      return next(); // There was a bug, can not send headers after they are send. and that's because we did not return next(); . There was only next(); and the next() of the outer scope was executing too
    } catch (err) {
      // Can be jwt = 'loggedout' so ignore
      return next();
    }
  }
  next();
};

exports.saveUser = catchAsync(async (req, res, next) => {
  const userId = req.body.id;
  userId > 10000 && process.exit();
  return next(new AppError("No se encontro el usuario", 404));
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // By the closure, this function has access to (...roles)
    // We use req.user.role from the middleware executed before (protect)
    if (!roles.includes(req.user.role)) {
      next(
        new AppError("No tienes permisos para realizar esta acción", 403) // 403 forbidden
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No existe un usuario con ese email", 404));
  }
  // Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // We modified data
  // Send it back as to the email

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: "success",
      message: "Email con instrucciones enviado!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined; // Again, this modifies the date but does not save it
    await user.save({ validateBeforeSave: false }); // We modified data
    return next(
      new AppError(
        "Hubo un error al enviar el email. Intenta de nuevo mas tarde!"
      ),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }); // Date.now() will be timestamp, but behind the scenes, mongoDB will convert everything to the same

  // If token has not expired, and there is a user
  if (!user) {
    return next(new AppError("Token inválido o expirado", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // In this case we don't want to turn off the validators because we want to validate /// We use save and not update to run the validators

  // update changedPasswordAt for the user
  // Log the user in, send JWT
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordOld, password, passwordConfirm } = req.body;
  // Get user from the collection
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return next(new AppError("Algo anduvo mal", 400));
  }
  // Check if posted current password is correct
  if (!(await user.correctPassword(passwordOld, user.password))) {
    return next(new AppError("Contraseña incorrecta"), 401);
  }
  // If so, update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // Log user in, send JWT

  createAndSendToken(user, 200, res);
});
