const mongoose = require("mongoose");

const groupsSchema = new mongoose.Schema({
  name: String,
  users: [
    {
      id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],
});

const Group = mongoose.model("Group", groupsSchema);

module.exports = Group;
