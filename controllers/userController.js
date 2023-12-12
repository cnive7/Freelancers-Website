const Cv = require("../models/cvModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
const Group = require("../models/groupModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const { ObjectId } = require("mongoose");
const stringify = require("csv-stringify");
const fs = require("fs");

// Faking the id coming from the params. To use getOne factory handler
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates", 400));
  }
  // Filtered fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;
  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup instead",
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do NOT update passwords with this updateOne!
exports.updateUser = factory.updateOne(User);
// exports.deleteUser = factory.deleteOne(User);

exports.deleteUser = catchAsync(async (req, res, next) => {
  await Cv.findOneAndDelete({ user: req.params.id });
  await Message.deleteMany({
    $or: [
      {
        from: req.params.id,
      },
      {
        to: req.params.id,
      },
    ],
  });
  await Group.updateMany(
    {},
    {
      $pull: { users: { id: req.params.id } },
    }
  );
  const doc = await User.findByIdAndDelete(req.params.id);
  if (!doc)
    return next(new AppError("No se encontro un usuario con esa ID", 404));
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUsersList = catchAsync(async (req, res, next) => {
  const users = await User.find(
    {},
    { name: 1, lastName: 1, email: 1, _id: 0, password: 1 }
  );
  const csv = users.map((user) => {
    return [user.name, user.lastName, user.email];
  });
  stringify.stringify(csv, function (err, output) {
    if (err) {
      console.log(error);
    }
    fs.writeFile("public/files/users.csv", output, (err) => {
      if (err) console.log(err);
      else {
        const file = `public/files/users.csv`;
        res.download(file);
      }
    });
  });
});

exports.getUsersCompletedList = catchAsync(async (req, res, next) => {
  const cv = await Cv.find().populate("user");

  const csv = cv.map((user) => {
    return [user.user.name, user.user.lastName, user.user.email];
  });
  stringify.stringify(csv, function (err, output) {
    if (err) {
      console.log(error);
    }
    fs.writeFile("public/files/usersCompleted.csv", output, (err) => {
      if (err) console.log(err);
      else {
        const file = `public/files/usersCompleted.csv`;
        res.download(file);
      }
    });
  });
});

exports.getUsersUncompletedList = catchAsync(async (req, res, next) => {
  const freelancersUncompleted = [];
  const users = await User.find();
  await Promise.all(
    users.map(async (user) => {
      const hasCv = await Cv.findOne({ user: user._id });
      if (!hasCv) {
        freelancersUncompleted.push(user);
      }
    })
  );
  const freelancersUncompletedSorted = freelancersUncompleted.sort(function (
    a,
    b
  ) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const csv = freelancersUncompletedSorted.map((user) => {
    return [user.name, user.lastName, user.email];
  });

  stringify.stringify(csv, function (err, output) {
    if (err) {
      console.log(error);
    }
    fs.writeFile("public/files/usersUncompleted.csv", output, (err) => {
      if (err) console.log(err);
      else {
        const file = `public/files/usersUncompleted.csv`;
        res.download(file);
      }
    });
  });
});
