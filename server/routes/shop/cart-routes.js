const express = require("express");
const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
  clearCart, // Thêm API xóa toàn bộ giỏ hàng
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

// Thêm sản phẩm vào giỏ hàng
router.post("/add", addToCart);

// Lấy danh sách sản phẩm trong giỏ hàng của một người dùng
router.get("/get/:userId", fetchCartItems);

// Cập nhật số lượng của một sản phẩm trong giỏ hàng
router.put("/update-cart", updateCartItemQty);

// Xóa một sản phẩm cụ thể khỏi giỏ hàng
router.delete("/:userId/:productId/:colorId/:sizeId", deleteCartItem);

// Xóa toàn bộ giỏ hàng
router.delete("/clear/:userId", clearCart);

module.exports = router;

// const express = require("express");
// const {
//   addToCart,
//   fetchCartItems,
//   deleteCartItem,
//   updateCartItem, // Cập nhật sản phẩm với màu sắc, kích thước và số lượng
//   clearCart, // Xóa toàn bộ giỏ hàng
// } = require("../../controllers/shop/cart-controller");

// const router = express.Router();

// // Thêm sản phẩm vào giỏ hàng
// router.post("/add", addToCart);

// // Lấy danh sách sản phẩm trong giỏ hàng của một người dùng
// router.get("/get/:userId", fetchCartItems);

// // Cập nhật thông tin sản phẩm (màu sắc, kích thước, số lượng)
// router.put("/update-item", updateCartItem);

// // Xóa một sản phẩm cụ thể khỏi giỏ hàng
// router.delete("/:userId/:productId/:colorId/:sizeId", deleteCartItem);

// // Xóa toàn bộ giỏ hàng
// router.delete("/clear/:userId", clearCart);

// module.exports = router;
