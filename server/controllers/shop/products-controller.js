const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    // Lấy các tham số từ query
    const {
      category = "",
      brand = "",
      sortBy = "price-lowtohigh",
      page = 1,
      pageSize = 10,
    } = req.query;

    // Tính toán skip
    const skip = (page - 1) * pageSize;

    // Thiết lập bộ lọc
    let filters = {};
    if (category) filters.category = { $in: category.split(",") };
    if (brand) filters.brand = { $in: brand.split(",") };

    // Xác định điều kiện sắp xếp
    let sortField = "sortPrice";
    let sortOrder = 1;

    if (sortBy === "price-lowtohigh") {
      sortField = "sortPrice";
      sortOrder = 1;
    } else if (sortBy === "price-hightolow") {
      sortField = "sortPrice";
      sortOrder = -1;
    } else if (sortBy === "title-atoz") {
      sortField = "title";
      sortOrder = 1;
    } else if (sortBy === "title-ztoa") {
      sortField = "title";
      sortOrder = -1;
    }

    // Pipeline MongoDB
    const pipeline = [
      { $match: filters },
      {
        $addFields: {
          sortPrice: {
            $cond: {
              if: { $eq: ["$salePrice", 0] },
              then: "$price",
              else: "$salePrice",
            },
          },
        },
      },
      { $sort: { [sortField]: sortOrder } }, // Sắp xếp theo trường
      { $skip: skip }, // Bỏ qua sản phẩm cho trang hiện tại
      { $limit: parseInt(pageSize) }, // Lấy số sản phẩm mỗi trang
    ];

    // Tính tổng sản phẩm
    const totalPipeline = [{ $match: filters }, { $count: "totalProducts" }];

    // Chạy pipeline và tổng sản phẩm
    const [products, totalCountResult] = await Promise.all([
      Product.aggregate(pipeline).collation({
        locale: "vi", // Sắp xếp theo tiếng Việt
        strength: 1, // Không phân biệt chữ hoa/chữ thường
      }),
      Product.aggregate(totalPipeline),
    ]);

    // Tổng số sản phẩm và trang
    const totalProducts = totalCountResult[0]?.totalProducts || 0;
    const totalPages = Math.ceil(totalProducts / pageSize);

    // Trả kết quả
    res.status(200).json({
      success: true,
      data: products,
      totalProducts,
      totalPages,
      currentPage: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình xử lý",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra một số lỗi",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };
