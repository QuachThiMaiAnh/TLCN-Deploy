const Order = require("../../models/Order");

// const getAllOrdersOfAllUsers = async (req, res) => {
//   try {
//     const orders = await Order.find({});

//     if (!orders.length) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy đơn hàng nào!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: orders,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Đã xảy ra lỗi!",
//     });
//   }
// };

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query; // Lấy page và pageSize từ query params
    const skip = (page - 1) * pageSize;

    const totalCount = await Order.countDocuments(); // Tổng số đơn hàng

    const orders = await Order.find({})
      .sort({ orderDate: -1 }) // Sắp xếp giảm dần
      .skip(skip) // Bỏ qua các bản ghi từ các trang trước
      .limit(Number(pageSize)); // Giới hạn số bản ghi trả về

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng nào!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
      totalCount, // Trả về tổng số bản ghi để tính tổng số trang
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

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
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

    await Order.findByIdAndUpdate(id, { orderStatus });

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
