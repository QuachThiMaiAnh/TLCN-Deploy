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

    // Chỉ định điều kiện sắp xếp
    let sortUsingLocaleCompare = false;
    let sortOrder = 1;

    switch (sortBy) {
      case "price-lowtohigh":
        sortOrder = 1;
        break;
      case "price-hightolow":
        sortOrder = -1;
        break;
      case "title-atoz":
      case "title-ztoa":
        sortUsingLocaleCompare = true;
        sortOrder = sortBy === "title-atoz" ? 1 : -1;
        break;
      default:
        sortOrder = 1;
    }

    // Pipeline cho aggregate
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
      // Thêm sắp xếp nếu không dùng localeCompare
      ...(sortUsingLocaleCompare ? [] : [{ $sort: { sortPrice: sortOrder } }]),
      { $skip: skip }, // Phân trang
      { $limit: parseInt(pageSize) }, // Giới hạn kết quả
    ];

    // Tính tổng sản phẩm
    const totalPipeline = [{ $match: filters }, { $count: "totalProducts" }];

    // Chạy pipeline
    const [products, totalCountResult] = await Promise.all([
      Product.aggregate(pipeline),
      Product.aggregate(totalPipeline),
    ]);

    // Tổng số sản phẩm
    const totalProducts = totalCountResult[0]?.totalProducts || 0;
    const totalPages = Math.ceil(totalProducts / pageSize);

    // Sắp xếp bằng localeCompare nếu cần
    if (sortUsingLocaleCompare) {
      products.sort((a, b) => {
        return sortOrder === 1
          ? a.title.localeCompare(b.title, "vi")
          : b.title.localeCompare(a.title, "vi");
      });
    }

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
