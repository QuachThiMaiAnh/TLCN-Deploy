/**
 * Thư viện cloudinary được sử dụng để tương tác với dịch vụ Cloudinary,
 * và multer dùng để quản lý việc tải lên file từ phía người dùng (như trong các form HTML).
 */
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// kết nối với tài khoản Cloudinary
cloudinary.config({
  cloud_name: "duxdsq6hd",
  api_key: "146644131618448",
  api_secret: "AwnwHrhEX3WRgwjJKDe6_GXvKJ0",
});

/**
 * multer.memoryStorage() sẽ lưu trữ file vào bộ nhớ RAM (thay vì lưu vào thư mục tạm). Khi file được tải lên,
 * nội dung sẽ được lưu trữ trong bộ nhớ dưới dạng Buffer, tiện lợi để chuyển tiếp trực tiếp tới Cloudinary.
 */
const storage = new multer.memoryStorage();

/**
 *
 * {imageUploadUtil là một hàm bất đồng bộ (asynchronous), nhận vào một file (dạng Buffer).
 * Hàm này gọi phương thức cloudinary.uploader.upload để tải lên file. resource_type: "auto" sẽ tự động nhận dạng
 * loại file (hình ảnh, video, v.v.), giúp Cloudinary xác định cách xử lý file.} file
 *
 */
async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

// upload là một middleware của multer đã cấu hình để lưu trữ file trong bộ nhớ, giúp bạn dễ dàng dùng middleware này để quản lý các route tải file.
const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
