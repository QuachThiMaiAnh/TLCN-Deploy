require("dotenv").config(); // Nạp biến môi trường từ file .env
const express = require("express");
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
} = require("./routes");

// Kết nối MongoDB sử dụng biến môi trường
mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();

// Thiết lập cổng từ biến môi trường
const PORT = process.env.PORT || 5000;

// Cấu hình CORS sử dụng biến môi trường
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Đọc URL từ biến môi trường
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

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

// app.use("/api/common/feature", commonFeatureRouter);
