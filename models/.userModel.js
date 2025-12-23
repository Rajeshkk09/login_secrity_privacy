const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    maxlength: [32, "Password cannot exceed 32 characters"],
    select: false, //  security
  },

  phone: {
    type: String,
  },

  accountVerified: {
    type: Boolean,
    default: false,
  },

  verificationCode: Number,
  verificationCodeExpire: Date,

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//  Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔍 Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationcode = async function () {
  function generateRandomFiveDigitNumber() {
    const firtDigit = Math.floor(Math.random() * 10) + 1;
    const reamingDigits = Math.floo(Math.random() * 10000)
      .toString()
      .padStart(4, 0);

    return parseInt(firtDigit + reamingDigits);
  }

  const verificationCode = generateRandomFiveDigitNumber();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 5 * 60 * 1000;

  return verificationCode;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
