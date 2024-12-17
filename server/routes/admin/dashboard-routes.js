const express = require("express");

const {
  getRevenueStatistics,
  getOrderStatistics,
  getInventoryStatistics,
  getSoldProductStatistics,
} = require("../../controllers/admin/dashboard-controller");

const router = express.Router();

// Định tuyến cho thống kê doanh thu
router.get("/revenue", getRevenueStatistics);

// Định tuyến cho thống kê đơn hàng và trạng thái
router.get("/orders", getOrderStatistics);

// Định tuyến cho thống kê sản phẩm tồn kho
router.get("/inventory", getInventoryStatistics);

// Định tuyến cho thống kê sản phẩm đã bán
router.get("/sold-products", getSoldProductStatistics);

module.exports = router;
