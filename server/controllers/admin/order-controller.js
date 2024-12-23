const Order = require("../../models/Order");
const Product = require("../../models/Product");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, orderStatus } = req.query; // Lấy giá trị page, limit và orderStatus từ query
    const skip = (page - 1) * limit;

    // Tạo đối tượng điều kiện lọc
    let filter = {};

    // Nếu có orderStatus trong query, thêm điều kiện lọc vào filter
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }

    // Truy vấn đơn hàng với phân trang và điều kiện lọc
    const orders = await Order.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ orderUpdateDate: -1 }); // Sắp xếp theo thời gian cập nhật đơn hàng mới nhất (có thể thay đổi theo yêu cầu)

    // Đếm tổng số đơn hàng phù hợp với filter
    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin đơn hàng
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    // Lấy thông tin chi tiết sản phẩm (tên màu và kích thước)
    const cartItemsWithDetails = await Promise.all(
      order.cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) return item;

        // Tìm thông tin màu sắc
        const color = product.colors.find(
          (c) => c._id.toString() === item.colorId
        );
        const colorName = color ? color.name : "Không xác định";

        // Tìm thông tin kích thước
        const size = color?.sizes.find((s) => s._id.toString() === item.sizeId);
        const sizeName = size ? size.size : "Không xác định";

        // Gắn thông tin vào cart item
        return {
          ...item.toObject(),
          colorName,
          sizeName,
        };
      })
    );

    // Trả về thông tin đơn hàng cùng chi tiết sản phẩm
    res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        cartItems: cartItemsWithDetails,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    // Cập nhật orderUpdateDate và kiểm tra nếu trạng thái là 'delivered'
    const updateData = {
      orderStatus,
      orderUpdateDate: new Date(), // Cập nhật thời gian cập nhật
    };

    // Nếu trạng thái là 'delivered' và paymentStatus chưa phải là 'paid', cập nhật paymentStatus
    if (orderStatus === "delivered" && order.paymentStatus !== "paid") {
      updateData.paymentStatus = "paid";
    }

    await Order.findByIdAndUpdate(id, updateData);

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
