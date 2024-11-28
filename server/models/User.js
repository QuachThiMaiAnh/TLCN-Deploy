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
  resetPasswordToken: {
    type: String, // Lưu mã token reset mật khẩu
  },
  resetPasswordExpire: {
    type: Date, // Lưu thời gian hết hạn của token
  },
});

// Tự động thêm thời gian tạo và cập nhật vào mỗi bản ghi
UserSchema.set("timestamps", true);

const User = mongoose.model("User", UserSchema);
module.exports = User;
