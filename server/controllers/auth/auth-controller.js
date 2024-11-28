const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");
const nodemailer = require("nodemailer");
const User = require("../../models/User");
require("dotenv").config();

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
    /**
     * Gọi next() để tiếp tục chuyển xử lý tới middleware hoặc controller tiếp theo.
     * Điều này giúp yêu cầu tiếp tục đến các route bảo mật mà không cần xác thực lại người dùng.
     */
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Không thể xác thực được người dùng!",
    });
  }
};

// // const forgotPassword = async (req, res) => {
// //   const { email } = req.body;

// //   try {
// //     // Kiểm tra xem email có tồn tại trong hệ thống hay không
// //     const user = await User.findOne({ email });
// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Không tìm thấy người dùng với email này!",
// //       });
// //     }

// //     // Tạo token khôi phục mật khẩu với thời hạn 15 phút
// //     const resetToken = jwt.sign({ id: user._id }, "RESET_PASSWORD_SECRET_KEY", {
// //       expiresIn: "15m",
// //     });

// //     // Tạo transporter để gửi email
// //     const transporter = nodemailer.createTransport({
// //       service: "gmail",
// //       auth: {
// //         user: process.env.EMAIL_USER,
// //         pass: process.env.EMAIL_PASS,
// //       },
// //     });

// //     // Nội dung email
// //     const mailOptions = {
// //       from: process.env.EMAIL_USER,
// //       to: email,
// //       subject: "Khôi phục mật khẩu",
// //       text: `Bạn đã yêu cầu khôi phục mật khẩu. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu (có hiệu lực trong 15 phút):\n\nhttp://your-domain.com/reset-password/${resetToken}\n\nNếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.`,
// //     };

// //     // Gửi email
// //     await transporter.sendMail(mailOptions);

// //     res.status(200).json({
// //       success: true,
// //       message: "Liên kết khôi phục mật khẩu đã được gửi tới email của bạn.",
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Đã xảy ra lỗi khi gửi email khôi phục mật khẩu.",
// //     });
// //   }
// // };

// // QUÊN MẬT KHẨU
// const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     // Kiểm tra xem email có tồn tại trong hệ thống không
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "Email không tồn tại trong hệ thống!",
//       });
//     }

//     // Tạo mã thông báo khôi phục (reset token)
//     const resetToken = crypto.lib.WordArray.random(32).toString(crypto.enc.Hex);
//     const resetTokenHash = crypto.SHA256(resetToken).toString(crypto.enc.Hex);

//     // Lưu mã thông báo hash vào cơ sở dữ liệu và đặt thời gian hết hạn (15 phút)
//     user.resetPasswordToken = resetTokenHash;
//     user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 phút
//     await user.save();

//     // Tạo liên kết reset mật khẩu
//     const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

//     // Cấu hình gửi email
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: "quachthimaianh2002@gmail.com",
//       subject: "Yêu cầu khôi phục mật khẩu",
//       html: `
//         <p>Chào ${user.userName},</p>
//         <p>Bạn đã yêu cầu khôi phục mật khẩu. Nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
//         <a href="${resetUrl}">${resetUrl}</a>
//         <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({
//       success: true,
//       message: "Email khôi phục mật khẩu đã được gửi!",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Đã xảy ra lỗi trong quá trình gửi email khôi phục mật khẩu.",
//     });
//   }
// };

// // const resetPassword = async (req, res) => {
// //   const { token, newPassword, confirmPassword } = req.body;

// //   if (newPassword !== confirmPassword) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Mật khẩu và xác nhận mật khẩu không khớp!",
// //     });
// //   }

// //   try {
// //     // Xác thực token
// //     const decoded = jwt.verify(token, "RESET_PASSWORD_SECRET_KEY");
// //     const userId = decoded.id;

// //     // Tìm người dùng và cập nhật mật khẩu
// //     const user = await User.findById(userId);
// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Không tìm thấy người dùng!",
// //       });
// //     }

// //     const hashedPassword = await bcrypt.hash(newPassword, 10);
// //     user.password = hashedPassword;
// //     await user.save();

// //     res.status(200).json({
// //       success: true,
// //       message: "Mật khẩu đã được cập nhật thành công.",
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Đã xảy ra lỗi khi đặt lại mật khẩu.",
// //     });
// //   }
// // };

// const resetPassword = async (req, res) => {
//   const { newPassword, confirmPassword } = req.body;
//   const { token } = req.params;

//   console.log("Params:", req.params);
//   console.log("Token từ URL:", req.params.token);

//   // Kiểm tra token
//   if (!token) {
//     return res.status(400).json({
//       success: false,
//       message: "Token không hợp lệ hoặc bị thiếu!", // "Invalid or missing token!"
//     });
//   }

//   // Kiểm tra mật khẩu có khớp nhau không
//   if (newPassword !== confirmPassword) {
//     return res.status(400).json({
//       success: false,
//       message: "Mật khẩu và xác nhận mật khẩu không khớp!", // "Passwords do not match!"
//     });
//   }

//   try {
//     // Xác thực token
//     const decoded = jwt.verify(token, "RESET_PASSWORD_SECRET_KEY"); // Đảm bảo secret key đúng
//     const userId = decoded.id;

//     // Tìm người dùng
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy người dùng!", // "User not found!"
//       });
//     }

//     // Hash mật khẩu mới và lưu
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Mật khẩu đã được cập nhật thành công.", // "Password has been successfully updated."
//     });
//   } catch (error) {
//     console.error("Lỗi xác thực token:", error);
//     return res.status(500).json({
//       success: false,
//       message:
//         error.name === "JsonWebTokenError"
//           ? "Token không hợp lệ!" // "Invalid token!"
//           : "Đã xảy ra lỗi khi đặt lại mật khẩu.", // "An error occurred while resetting the password."
//     });
//   }
// };

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra xem email có tồn tại trong hệ thống không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống!",
      });
    }

    // Tạo token khôi phục bằng JWT với thời hạn 15 phút
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_PASSWORD_SECRET_KEY,
      { expiresIn: "15m" } // Token hết hạn sau 15 phút
    );

    // Tạo liên kết đặt lại mật khẩu
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

    // Cấu hình email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Yêu cầu khôi phục mật khẩu",
      html: `
        <p>Chào ${user.userName},</p>
        <p>Bạn đã yêu cầu khôi phục mật khẩu. Nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
        <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Email khôi phục mật khẩu đã được gửi!",
    });
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    res.status(500).json({
      success: false,
      message: "Không thể gửi email khôi phục mật khẩu!",
    });
  }
};

const resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { token } = req.params;

  // Kiểm tra token có hợp lệ không
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token không hợp lệ hoặc bị thiếu!",
    });
  }

  // Kiểm tra mật khẩu mới và xác nhận mật khẩu
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Mật khẩu và xác nhận mật khẩu không khớp!",
    });
  }

  try {
    // Xác thực token và lấy ID người dùng
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET_KEY);
    const userId = decoded.id;

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    // Cập nhật mật khẩu mới (mã hóa trước khi lưu)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Lưu lại người dùng
    await user.save();

    res.status(200).json({
      success: true,
      message: "Mật khẩu đã được cập nhật thành công.",
    });
  } catch (error) {
    console.error("Lỗi xác thực token:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn! Vui lòng yêu cầu một token mới.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi đặt lại mật khẩu.",
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
};
