const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

// Xử lý upload hình ảnh lên Cloudinary
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

// Tính tổng stock từ colors
const calculateTotalStock = (colors) => {
  return colors.reduce((total, color) => {
    const colorStock = color.sizes.reduce(
      (sum, size) => sum + (size.quantity || 0),
      0
    );
    return total + colorStock;
  }, 0);
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
      averageReview,
      colors, // chứa thông tin màu và kích thước
    } = req.body;

    // Kiểm tra điều kiện price < salePrice
    if (salePrice > price) {
      return res.status(400).json({
        success: false,
        message: "Giá khuyến mãi không thể lớn hơn giá sản phẩm !",
      });
    }

    // Tính tổng số lượng tồn kho từ colors
    const totalStock = calculateTotalStock(colors);

    const newlyCreatedProduct = new Product({
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock, // không nhận từ req.body, tự tính toán
      averageReview,
      colors, // lưu danh sách màu sắc
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
      message: "Đã xảy ra lỗi nào đó !",
    });
  }
};

// Sửa sản phẩm
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      averageReview,
      colors, // chứa thông tin màu và kích thước
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm này !",
      });
    }

    // Kiểm tra điều kiện price < salePrice
    if (salePrice > price) {
      return res.status(400).json({
        success: false,
        message: "Giá khuyến mãi không thể lớn hơn giá sản phẩm !",
      });
    }

    // Cập nhật sản phẩm
    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price =
      typeof price === "number" && price >= 0 ? price : findProduct.price;
    findProduct.salePrice =
      typeof salePrice === "number" && salePrice >= 0
        ? salePrice
        : findProduct.salePrice;
    findProduct.images = images || findProduct.images;
    findProduct.averageReview = averageReview || findProduct.averageReview;

    if (colors) {
      findProduct.colors = colors; // cập nhật colors
      findProduct.totalStock = calculateTotalStock(colors); // tự tính lại tổng tồn kho
    }

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

// Lấy danh sách sản phẩm với phân trang
// const fetchAllProducts = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.pageSize) || 10;

//     const skip = (page - 1) * pageSize;

//     const products = await Product.find().skip(skip).limit(pageSize);

//     const totalProducts = await Product.countDocuments();

//     res.status(200).json({
//       success: true,
//       data: products,
//       totalProducts,
//       currentPage: page,
//       totalPages: Math.ceil(totalProducts / pageSize),
//       pageSize,
//     });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({
//       success: false,
//       message: "Đã xảy ra lỗi nào đó !",
//     });
//   }
// };

// Lấy danh sách sản phẩm với phân trang và lọc
const fetchAllProducts = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category, brand, search } = req.query;

    const skip = (page - 1) * pageSize;

    // Tạo điều kiện lọc
    const filterConditions = {};

    if (category) {
      filterConditions.category = category; // Lọc theo category
    }
    if (brand) {
      filterConditions.brand = brand; // Lọc theo brand
    }
    if (search) {
      filterConditions.title = { $regex: search, $options: "i" }; // Lọc theo từ khóa
    }

    const products = await Product.find(filterConditions)
      .sort({ createdAt: -1 }) // Thêm phần này để sắp xếp theo ngày tạo giảm dần
      .skip(skip)
      .limit(parseInt(pageSize));

    const totalProducts = await Product.countDocuments(filterConditions);

    res.status(200).json({
      success: true,
      data: products,
      totalProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / pageSize),
      pageSize: parseInt(pageSize),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi nào đó !",
    });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm này",
      });
    }

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
