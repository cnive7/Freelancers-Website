const mongoose = require("mongoose");

const adminId =
  process.env.NODE_ENV === "production"
    ? process.env.ADMIN_ID
    : process.env.ADMIN_ID_LOCAL;

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: adminId,
    },
    messageBody: {
      type: String,
    },
    messageType: {
      // Type of the message(text)
      type: String,
      default: "text",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ to: -1, from: -1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
