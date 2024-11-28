const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    images: {
      type: [String],
      required: true,
    },
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    sales: {
      type: Number,
      default: 0,
    },
    colors: [
      {
        colorName: String, // Tên màu
        imageUrl: String, // Ảnh minh họa cho màu sắc
      },
    ],
    sizes: [String], // Danh sách các kích thước (ví dụ: "39", "40", "41")
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
