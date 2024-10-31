const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
// Sau bước này sẽ chuyển người dùng đến trang tiếp theo mà không cần phải đăng nhập lại
router.get("/check-auth", authMiddleware, (req, res) => {
  /**
   * user: {id, userName, email, role,..}
   */
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Người dùng đã xác thực!",
    user,
  });
});

module.exports = router;
