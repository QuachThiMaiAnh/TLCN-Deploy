const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  /**
   * lọc và sắp xếp sản phẩm từ cơ sở dữ liệu dựa trên các tiêu chí từ phía người dùng.
   *
   * category, brand, và sortBy được lấy từ req.query, là các tham số lọc và sắp xếp được gửi qua URL.
   * URL: category=men%2Cwomen&brand=nike%2Cadidas
   * filters sẽ lưu các tiêu chí lọc, sau đó được truyền vào truy vấn tìm kiếm trong cơ sở dữ liệu.
   * category.split(",") và brand.split(",") chuyển đổi category và brand từ chuỗi thành mảng bằng cách tách chúng tại dấu phẩy.
   * Nếu có giá trị trong category, filters.category = { $in: [...] } sẽ chỉ lấy các sản phẩm có thuộc tính category thuộc mảng giá trị đã chọn.
   * sortBy có các giá trị cho sắp xếp như "price-lowtohigh", "price-hightolow", "title-atoz", và "title-ztoa".
  1 và -1 chỉ định thứ tự sắp xếp: 1 tăng dần, -1 giảm dần
    Product.find(filters) truy vấn cơ sở dữ liệu để lấy các sản phẩm thỏa mãn điều kiện trong filters.
  .sort(sort) sắp xếp kết quả theo điều kiện trong sort.

  Kết quả filters:
  {
  category: { $in: ["electronics", "clothing"] },
  brand: { $in: ["nike", "adidas"] }
  }
  Thiết lập sort thành { title: 1 } (sắp xếp theo tên từ A đến Z).
  => hàm sẽ trả danh sách sản phẩm từ cơ sở dữ liệu theo tiêu chí lọc và sắp xếp đã thiết lập.
   */
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sortUsingLocaleCompare = false;
    let sortOrder = 1;

    // Chỉ định điều kiện sắp xếp, sử dụng `localeCompare` khi sắp xếp theo `title`

    // Kiểm tra loại sắp xếp
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
        break;
    }

    // Sử dụng aggregate để thêm trường `sortPrice` và sắp xếp
    let products = await Product.aggregate([
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
      // Chỉ thêm `$sort` khi không cần `localeCompare`
      ...(sortUsingLocaleCompare ? [] : [{ $sort: { sortPrice: sortOrder } }]),
    ]);

    // Nếu cần sắp xếp bằng `localeCompare` theo `title`
    if (sortUsingLocaleCompare) {
      products.sort((a, b) => {
        return sortBy === "title-atoz"
          ? a.title.localeCompare(b.title, "vi")
          : b.title.localeCompare(a.title, "vi");
      });
    }
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra một số lỗi",
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
