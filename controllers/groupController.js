const factory = require("../controllers/handlerFactory");
const Group = require("../models/groupModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllGroups = factory.getAll(Group);
exports.createGroup = factory.createOne(Group);
exports.deleteGroup = factory.deleteOne(Group);

exports.addToGroup = catchAsync(async (req, res, next) => {
  const updatedGroup = await Group.findByIdAndUpdate(
    req.body.id,
    {
      $push: { users: { id: req.params.userId } },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    data: {
      data: updatedGroup,
    },
  });
});

exports.deleteFromGroup = catchAsync(async (req, res, next) => {
  const updatedGroup = await Group.findOneAndUpdate(
    { _id: req.body.id },
    {
      $pull: { users: { id: req.params.userId } },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    data: {
      data: updatedGroup,
    },
  });
});
