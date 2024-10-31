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
      "Hoạt động",
      "Không hoạt động",
      "Bị tạm khóa",
      "Đang chờ xác minh",
      "Đã vô hiệu hóa",
    ],
    default: "Đang chờ xác minh",
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
