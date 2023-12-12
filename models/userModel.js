const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Se require el nombre"],
  },
  lastName: {
    type: String,
    required: [true, "Se requiere el apellido"],
  },
  email: {
    type: String,
    required: [true, "Se requiere un email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Por favor ingresa un email válido"],
  },
  occupation: {
    type: String,
  },
  role: {
    type: String,
    enum: ["freelancer", "admin"],
    default: "freelancer",
  },
  photo: { type: String, default: "default.jpg" },
  password: {
    type: String,
    required: [true, "Por favor ingresa una contraseña"],
    minlength: 8, // Check if password is lower than 8 characters
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Por favor confirma tu contraseña"],
    validate: {
      // This only works when we create a new object, or on save
      validator: function (el) {
        return el === this.password;
      },
      message: "Las contraseñas ingresadas son diferentes",
    },
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  notifiedNewMessageDate: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // If the pasword was actually modified, run the code bellow
  // Bcrypt will salt the password and after will encript it. so 2 passwords have not the same hash
  this.password = await bcrypt.hash(this.password, 12); // const: larger the number more encryption

  this.passwordConfirm = undefined; // We do not want to persist to the db
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 2000; // We substact 2000 because sometimes DB operations are a bit slow and later we check if password was changed after the JWT token was generated to invalidate token.
  next();
});

userSchema.pre(/^find/, function (next) {
  // This keyword  points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// We will create an instance method, and a instance method is a method that will be available in all the documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // This.password will not be available because we set select: false, on the Schema // That's why we actually have to pass in the userPassword as well.
  return await bcrypt.compare(candidatePassword, userPassword); // Will return true or false
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const chagedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < chagedTimestamp;
  }
  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // We should never store a plain reset token into the db.
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
