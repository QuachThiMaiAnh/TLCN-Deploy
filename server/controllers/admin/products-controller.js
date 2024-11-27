const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

// Xử lý upload hình ảnh lên cloud
const handleImageUpload = async (req, res) => {
  try {
    const uploadResults = await Promise.all(
      req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const url = "data:" + file.mimetype + ";base64," + b64;
        const result = await imageUploadUtil(url);
        return result;
      })
    );

    res.json({
      success: true,
      results: uploadResults,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Thêm sản phẩm mới
const addProduct = async (req, res) => {
  try {
    const {
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    // console.log(averageReview, "averageReview");

    // Kiểm tra điều kiện price < salePrice
    if (salePrice > price) {
      return res.status(400).json({
        success: false,
        message: "Giá khuyến mãi không thể lớn hơn giá sản phẩm.",
      });
    }
    const newlyCreatedProduct = new Product({
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi nào đó",
    });
  }
};

//fetch all products

// const fetchAllProducts = async (req, res) => {
//   try {
//     //  find({}) là phương thức được gọi để lấy tất cả các tài liệu (documents) trong bộ sưu tập (collection)
//     const listOfProducts = await Product.find({});
//     res.status(200).json({
//       success: true,
//       data: listOfProducts,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Đã xảy ra lỗi nào đó",
//     });
//   }
// };
const fetchAllProducts = async (req, res) => {
  try {
    // Lấy thông tin phân trang từ query params
    const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
    const pageSize = parseInt(req.query.pageSize) || 10; // Số sản phẩm mỗi trang (mặc định là 10)

    // Tính toán bỏ qua và lấy dữ liệu
    const skip = (page - 1) * pageSize;

    // Giả sử bạn sử dụng Mongoose để truy vấn
    const products = await Product.find() // Tìm tất cả sản phẩm
      .skip(skip) // Bỏ qua số lượng sản phẩm dựa vào trang hiện tại
      .limit(pageSize); // Lấy số sản phẩm theo kích thước trang

    // Tính tổng số sản phẩm
    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      success: true,
      data: products,
      totalProducts, // Tổng số sản phẩm
      currentPage: page, // Trang hiện tại
      totalPages: Math.ceil(totalProducts / pageSize), // Tổng số trang
      pageSize, // Số sản phẩm mỗi trang
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi nào đó",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    /**
     * req.params: Đây là một đối tượng chứa các tham số URL của request (yêu cầu) khi sử dụng Express.js.
     * Các tham số này được truyền trong phần URL của đường dẫn theo dạng /path/:paramName.
     * Ví dụ: nếu đường dẫn là /product/123, thì req.params sẽ có dạng { id: '123' }.
     *
     *Destructuring ({ id }): Ở đây, cú pháp destructuring được sử dụng để lấy ra trực tiếp giá trị của thuộc tính id từ req.params.
     *Thay vì viết const id = req.params.id;, cú pháp này giúp viết ngắn gọn hơn và dễ đọc.
     */
    const { id } = req.params;
    const {
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm này",
      });

    // Kiểm tra điều kiện price < salePrice
    if (salePrice > price) {
      return res.status(400).json({
        success: false,
        message: "Giá khuyến mãi không thể lớn hơn giá sản phẩm.",
      });
    }

    // Thay dữ liệu mới cần cần nhật từ res, các trường không thay đỏi dữ liệu thì giữ nguyên
    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    // Kiểm tra price và salePrice, chỉ cập nhật nếu giá trị hợp lệ
    findProduct.price =
      typeof price === "number" && price >= 0 ? price : findProduct.price;
    findProduct.salePrice =
      typeof salePrice === "number" && salePrice >= 0
        ? salePrice
        : findProduct.salePrice;

    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.images = images || findProduct.images;
    findProduct.averageReview = averageReview || findProduct.averageReview;

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi nào đó",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm này",
      });

    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi nào đó",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
