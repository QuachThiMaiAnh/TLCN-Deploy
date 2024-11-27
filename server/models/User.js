const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  status: {
    type: String,
    enum: [
      "Active",
      "Inactive",
      "Temporarily Locked",
      "Pending Verification",
      "Disabled",
    ],
    default: "Pending Verification",
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
