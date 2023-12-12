const factory = require("../controllers/handlerFactory");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Email = require("../utils/email");
const catchAsync = require("../utils/catchAsync");

exports.getAllMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({
    $or: [
      {
        from: req.user._id,
      },
      {
        to: req.user._id,
      },
    ],
  }).sort({ createdAt: 1 });
  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      data: messages,
    },
  });
});

exports.setMessageFrom = (req, res, next) => {
  req.body.from = req.user._id;
  next();
};

exports.hasUnreadMessages = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next();
  }
  const search = await Message.findOne({ to: req.user._id, read: false });
  if (search) {
    req.user.hasUnreadMessages = true;
  }
  next();
});

exports.setReadAllMessages = catchAsync(async (req, res, next) => {
  await Message.updateMany(
    { to: req.user._id, from: req.params.id, read: false },
    { read: true }
  );
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { notifiedNewMessageDate: "" },
  });
});

exports.deleteChat = catchAsync(async (req, res, next) => {
  await Message.deleteMany({ from: req.user._id, to: req.params.id });
  await Message.deleteMany({ from: req.params.id, to: req.user._id });
  res.status(204).json({
    status: "success",
  });
});

exports.getAllChats = catchAsync(async (req, res, next) => {
  const chats = await Message.aggregate([
    {
      $match: {
        $or: [
          { to: ObjectId(req.params.id) },
          { from: ObjectId(req.params.id) },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          last_message_between: {
            $cond: [
              {
                $eq: ["$to", ObjectId(req.params.id)],
              },
              {
                $concat: [
                  { $toString: "$to" },
                  " and ",
                  { $toString: "$from" },
                ],
              },
              {
                $concat: [
                  { $toString: "$from" },
                  " and ",
                  { $toString: "$to" },
                ],
              },
            ],
          },
        },
        message: { $first: "$$ROOT" },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: chats.length,
    data: {
      data: chats,
    },
  });
});

exports.getAllMessagesFromUser = catchAsync(async (req, res, next) => {
  const messages = await Message.find({
    $or: [
      {
        from: req.user._id,
        to: req.params.id,
      },
      {
        from: req.params.id,
        to: req.user._id,
      },
    ],
  }).sort({ createdAt: 1 });
  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      data: messages,
    },
  });
});

exports.getAdminId = (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      data: process.env.ADMIN_ID,
    },
  });
};

exports.sendMessage = catchAsync(async (req, res, next) => {
  const doc = await Message.create(req.body);
  // {
  //   messageBody: 'Hello',
  //   to: '6345ebe0a82222424453b977',
  //   from: 633985f3a9616b47d0a07e91
  // }
  const toUser = await User.findById(req.body.to);
  const fromUser = await User.findById(req.body.from);
  const url = "https://amerilancers.com/contacto";

  if (toUser.notifiedNewMessageDate === undefined) {
    await User.findByIdAndUpdate(req.body.to, {
      notifiedNewMessageDate: Date.now(),
    });
    await new Email(toUser, url).sendNewMessageNotification({
      nombre: fromUser.name,
      apellido: fromUser.lastName,
      message: req.body.messageBody,
    });
  } else {
    const now = Date.now();
    const diff = now - toUser.notifiedNewMessageDate;
    if (diff > 600000) {
      await User.findByIdAndUpdate(req.body.to, {
        notifiedNewMessageDate: Date.now(),
      });
      await new Email(toUser, url).sendNewMessageNotification({
        nombre: fromUser.name,
        apellido: fromUser.lastName,
        message: req.body.messageBody,
      });
    }
  }

  res.status(201).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
