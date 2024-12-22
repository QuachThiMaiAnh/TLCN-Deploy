const express = require("express");

const {
  getUserById,
  updateUserStatus,
  changePassword,
  createUser,
  deleteUser,
  updateUserInfo,
  getUsersWithPagination,
  verifyEmail,
} = require("../../controllers/common/user-controllor");

const router = express.Router();

// Lấy thông tin một người dùng
router.get("/:id", getUserById);

// Cập nhật trạng thái người dùng
router.put("/:id/status", updateUserStatus);

// Đổi mật khẩu người dùng
router.put("/:id/password", changePassword);

// Tạo người dùng mới
router.post("/create", createUser);

// Xóa một người dùng
router.delete("/:id", deleteUser);

// Cập nhật thông tin người dùng
router.put("/:id", updateUserInfo);

// Lấy danh sách người dùng với phân trang
router.get("/", getUsersWithPagination);

// Xác minh email người dùng
router.post("/verify-email", verifyEmail);

module.exports = router;
