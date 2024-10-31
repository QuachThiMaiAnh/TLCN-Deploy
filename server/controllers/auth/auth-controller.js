const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

//REGISTER
const registerUser = async (req, res) => {
  const { userName, email, password, confirmPassword } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message:
          "Người dùng đã tồn tại trong hệ thống với cùng một email! Vui lòng thử lại.",
      });

    // Kiểm tra password và confirmPassword
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Mật khẩu và xác nhận mật khẩu không khớp! Vui lòng thử lại.",
      });
    }

    // mã hóa mật khẩu trước khi lưu vào csdl
    // (password, saltRounds)
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Đã đăng ký thành công",
    });
  } catch (e) {
    // in ra chi tiết lỗi
    console.log(e);
    // lỗi xảy ra ở phía máy chủ khi xử lý yêu cầu.
    // không mô tả chi tiết nguyên nhân cụ thể mà chỉ là thông báo chung về lỗi máy chủ nội bộ
    res.status(500).json({
      success: false,
      message: "Đã xảy ra một số lỗi",
    });
  }
};

//LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // checkUser ( đối tượng|| null)
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "Người dùng không tồn tại! Vui lòng đăng ký trước",
      });

    // so sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong cơ sở dữ liệu.
    // checkPasswordMatch (true|| false)
    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Mật khẩu không đúng! Vui lòng thử lại",
      });

    // jwt chuỗi mã hóa thường dùng để xác thực người dùng trong ứng dụng
    // Hàm jwt.sign() được sử dụng để tạo ra một token mã hóa dựa trên thông tin được cung cấp.
    const token = jwt.sign(
      // payload: Dữ liệu chứa thông tin về người dùng, được mã hóa bên trong token.
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      // secretOrPrivateKey: Chuỗi bí mật để mã hóa token.
      // Token chỉ có thể được giải mã hoặc xác thực lại bằng cách sử dụng đúng chuỗi bí mật này.
      "CLIENT_SECRET_KEY",
      // thời gian hết hạn của token.
      // 60 phút
      { expiresIn: "60m" }
    );

    /**
     *Cookie token chứa JWT sẽ được lưu trên trình duyệt client.
    Client có thể sử dụng cookie này để gửi các yêu cầu tiếp theo đến server mà không cần đính kèm token vào mỗi yêu cầu
    Server có thể kiểm tra cookie này để xác minh người dùng, và nếu token hợp lệ, server sẽ cho phép thực hiện các thao tác mà không yêu cầu đăng nhập lại.
     */
    /**
     *  httpOnly: true, secure: false }: 
    httpOnly: true: Giúp bảo vệ cookie bằng cách ngăn trình duyệt JavaScript truy cập nó. 
    secure: false: Tùy chọn này cho phép cookie được gửi qua kết nối không an toàn HTTP. 
     */
    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Đã đăng nhập thành công",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra một số lỗi",
    });
  }
};

//LOGOUT

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Đã đăng xuất thành công!",
  });
};

//AUTH MIDDLEWARE
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      // Trả về HTTP status 401 (Unauthorized)
      success: false,
      message: "Không thể xác thực được người dùng!",
    });

  try {
    // wt.verify trả về dữ liệu gốc chứa thông tin người dùng (gọi là decoded).
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    // gán dữ liệu đã giải mã vào thuộc tính req.user để các middleware/ controller khác có thể truy cập thông tin người dùng.
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Không thể xác thực được người dùng!",
    });
  }
  /**
   * Gọi next() để tiếp tục chuyển xử lý tới middleware hoặc controller tiếp theo.
   * Điều này giúp yêu cầu tiếp tục đến các route bảo mật mà không cần xác thực lại người dùng.
   */
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
