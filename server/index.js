require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const express = require("express");
const semver = require("semver");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const {
  authRouter,
  adminProductsRouter,
  adminOrderRouter,
  shopProductsRouter,
  shopCartRouter,
  shopAddressRouter,
  shopOrderRouter,
  shopSearchRouter,
  shopReviewRouter,
  commonFeatureRouter,
  adminDashboardRouter,
  commonUserRouter,
} = require("./routes");

// Kết nối MongoDB sử dụng biến môi trường
mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const path = require("path");

// Thiết lập cổng từ biến môi trường
const PORT = process.env.PORT || 5000;

// Cấu hình CORS sử dụng biến môi trường
app.use(
  cors({
    origin: "https://tlcn-deploy-1.onrender.com", // Đọc URL từ biến môi trường
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));

// Route chính
app.use("/api/auth", authRouter);

app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/statistics", adminDashboardRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/feature", commonFeatureRouter);
app.use("/api/common/user", commonUserRouter);

// Phục vụ các file tĩnh đã biên dịch của React
app.use(express.static(path.join(__dirname, "../client/dist")));

// Mọi request khác sẽ trả về file HTML chính của React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});
