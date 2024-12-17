const Order = require("../../models/Order");
const Product = require("../../models/Product");
const mongoose = require("mongoose");

// Hàm giúp định dạng ngày theo loại nhóm (ngày, tuần, tháng, quý, năm)
const formatDateForChart = (dateObj, type) => {
  switch (type) {
    case "day":
      return `${dateObj.year}-${String(dateObj.month).padStart(
        2,
        "0"
      )}-${String(dateObj.day).padStart(2, "0")}`; // Định dạng ngày: yyyy-mm-dd
    case "week":
      return `Week ${dateObj.week} of ${dateObj.year}`; // Định dạng tuần: Week {week} of {year}
    case "month":
      return `${String(dateObj.month).padStart(2, "0")}-${dateObj.year}`; // Định dạng tháng: mm-yyyy
    case "quarter":
      return `Q${dateObj.quarter} ${dateObj.year}`; // Định dạng quý: Q{quarter} {year}
    case "year":
      return `${dateObj.year}`; // Định dạng năm: yyyy
    default:
      return `${dateObj.year}-${String(dateObj.month).padStart(
        2,
        "0"
      )}-${String(dateObj.day).padStart(2, "0")}`;
  }
};

// Hàm nhóm theo loại thời gian (ngày, tuần, tháng, quý, năm)
const getGroupingField = (type) => {
  switch (type) {
    case "day":
      return { year: "$year", month: "$month", day: "$day" }; // Nhóm theo ngày
    case "week":
      return { year: "$year", week: "$week" }; // Nhóm theo tuần
    case "month":
      return { year: "$year", month: "$month" }; // Nhóm theo tháng
    case "quarter":
      return { year: "$year", quarter: "$quarter" }; // Nhóm theo quý
    case "year":
      return { year: "$year" }; // Nhóm theo năm
    default:
      throw new Error("Invalid date range type");
  }
};

// Hàm giúp tính toán khoảng thời gian cho các loại thống kê (ngày, tuần, tháng, quý, năm)
const getDateRange = (type, customDate, endDate) => {
  const now = customDate ? new Date(customDate) : new Date();
  let startDate;

  switch (type) {
    case "day":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0); // Ngày bắt đầu
      break;
    case "week":
      const weekDay = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - weekDay); // Đảm bảo bắt đầu từ Chủ Nhật
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Ngày đầu tháng
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1); // Ngày đầu quý
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1); // Ngày đầu năm
      break;
    default:
      throw new Error("Invalid date range type");
  }

  // Đảm bảo ngày kết thúc là ngày hôm nay
  if (endDate) {
    endDate.setHours(23, 59, 59, 999); // Đặt giờ kết thúc của ngày hôm nay
  }

  return { startDate, endDate };
};

// Thống kê doanh thu
const getRevenueStatistics = async (req, res) => {
  try {
    const { type = "day", date } = req.query;

    // Xác định ngày bắt đầu và ngày kết thúc dựa trên type
    const endDate = new Date(); // Ngày hôm nay
    const { startDate } = getDateRange(type, date, endDate);

    // Truy vấn doanh thu theo khoảng thời gian
    const revenueData = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate },
          paymentStatus: "paid",
        },
      },
      {
        $project: {
          orderDate: 1,
          totalAmount: 1,
          year: { $year: "$orderDate" },
          month: { $month: "$orderDate" },
          day: { $dayOfMonth: "$orderDate" },
          week: { $isoWeek: "$orderDate" },
          quarter: {
            $cond: [
              { $lte: [{ $month: "$orderDate" }, 3] },
              1,
              {
                $cond: [
                  { $lte: [{ $month: "$orderDate" }, 6] },
                  2,
                  {
                    $cond: [{ $lte: [{ $month: "$orderDate" }, 9] }, 3, 4],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: getGroupingField(type), // Nhóm theo loại thời gian
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 }, // Sắp xếp tăng dần theo thời gian
      },
    ]);

    // Tính toán doanh thu ngày hôm nay
    const todayStartDate = new Date();
    todayStartDate.setHours(0, 0, 0, 0);
    const todayEndDate = new Date();
    todayEndDate.setHours(23, 59, 59, 999);

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: todayStartDate, $lte: todayEndDate },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const todayRevenueAmount = todayRevenue.length
      ? todayRevenue[0].totalRevenue
      : 0;

    // Định dạng dữ liệu trả về
    const chartData = revenueData.map((item) => ({
      date: formatDateForChart(item._id, type),
      revenue: item.totalRevenue,
    }));

    res.status(200).json({
      success: true,
      data: {
        todayRevenue: todayRevenueAmount, // Doanh thu ngày hôm nay
        type, // Loại thống kê (day, week, month, quarter, year)
        revenueByTimePeriod: chartData, // Dữ liệu doanh thu
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi!",
    });
  }
};

// Thống kê đơn hàng và trạng thái
const getOrderStatistics = async (req, res) => {
  try {
    const { type = "month", date } = req.query;

    // Lấy ngày bắt đầu và kết thúc dựa trên loại thống kê
    const endDate = new Date();
    const { startDate } = getDateRange(type, date, endDate);

    // Thống kê số đơn hàng theo trạng thái trong khoảng thời gian
    const orderStats = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$orderStatus", // Nhóm theo trạng thái đơn hàng
          count: { $sum: 1 }, // Đếm số lượng đơn hàng
        },
      },
      {
        $sort: { _id: 1 }, // Sắp xếp theo trạng thái đơn hàng
      },
    ]);

    // Tổng số đơn hàng trong khoảng thời gian
    const totalOrders = await Order.countDocuments({
      orderDate: { $gte: startDate, $lte: endDate },
    });

    // Tính tổng số đơn hàng trong ngày hôm nay
    const todayStartDate = new Date();
    todayStartDate.setHours(0, 0, 0, 0);
    const todayEndDate = new Date();
    todayEndDate.setHours(23, 59, 59, 999);

    const todayTotalOrders = await Order.countDocuments({
      orderDate: { $gte: todayStartDate, $lte: todayEndDate },
    });

    // Định dạng dữ liệu trả về
    res.status(200).json({
      success: true,
      data: {
        type, // Loại thống kê (day, week, month, quarter, year)
        orderStats, // Thống kê đơn hàng theo trạng thái
        totalOrders, // Tổng số đơn hàng trong khoảng thời gian
        todayTotalOrders, // Tổng số đơn hàng trong ngày hôm nay
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi!",
    });
  }
};

// Thống kê sản phẩm tồn kho
const getInventoryStatistics = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $project: {
          title: 1,
          totalStock: 1,
        },
      },
      {
        $sort: { totalStock: -1 }, // Sắp xếp theo số lượng tồn kho giảm dần
      },
    ]);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi!",
    });
  }
};

// Thống kê số lượng sản phẩm đã bán
const getSoldProductStatistics = async (req, res) => {
  try {
    const { type = "month", date } = req.query;
    const { startDate, endDate } = getDateRange(type, date);

    const soldProducts = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate },
          paymentStatus: "paid",
        },
      },
      {
        $unwind: "$cartItems",
      },
      {
        $group: {
          _id: "$cartItems.productId",
          totalSold: { $sum: "$cartItems.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          productId: "$_id",
          title: "$productDetails.title",
          totalSold: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: soldProducts,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi!",
    });
  }
};

module.exports = {
  getRevenueStatistics,
  getOrderStatistics,
  getInventoryStatistics,
  getSoldProductStatistics,
};
