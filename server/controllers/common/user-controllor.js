const bcrypt = require("bcryptjs");
const User = require("../models/User");

// 2. Lấy thông tin một người dùng
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy người dùng", error });
  }
};

// 3. Cập nhật trạng thái người dùng
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (
      ![
        "Active",
        "Inactive",
        "Temporarily Locked",
        "Pending Verification",
        "Disabled",
      ].includes(status)
    ) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    user.status = status;
    await user.save();
    res.status(200).json({ message: "Cập nhật trạng thái thành công", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật trạng thái người dùng", error });
  }
};

// 4. Đổi mật khẩu người dùng
const changePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đổi mật khẩu", error });
  }
};

// 5. Tạo người dùng mới
const createUser = async (req, res) => {
  const { userName, email, password, role, status } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      role: role || "user",
      status: status || "Pending Verification",
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "Tạo người dùng mới thành công", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo người dùng", error });
  }
};

// 6. Xóa người dùng
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    res.status(200).json({ message: "Xóa người dùng thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa người dùng", error });
  }
};

// 7. Cập nhật thông tin người dùng
const updateUserInfo = async (req, res) => {
  const { id } = req.params;
  const { userName, email, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
    res.status(200).json({ message: "Cập nhật thông tin thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin", error });
  }
};

// 8. Lấy danh sách người dùng với phân trang
const getUsersWithPagination = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const users = await User.find()
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments();
    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách người dùng", error });
  }
};

// 10. Xác minh email người dùng
const verifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (user.status === "Active")
      return res.status(400).json({ message: "Người dùng đã được xác minh" });

    user.status = "Active";
    await user.save();

    res.status(200).json({ message: "Xác minh email thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xác minh email", error });
  }
};

module.exports = {
  getUserById,
  updateUserStatus,
  changePassword,
  createUser,
  deleteUser,
  updateUserInfo,
  getUsersWithPagination,
  verifyEmail,
};
