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
        name: String, // Tên màu
        image: String, // Ảnh minh họa cho màu sắc
        sizes: [
          {
            size: String, // Kích thước (ví dụ: "39", "40", "41")
            quantity: {
              type: Number,
              default: 0, // Số lượng tồn kho
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
