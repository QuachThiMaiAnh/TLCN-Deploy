const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       cartItems,
//       addressInfo,
//       orderStatus,
//       paymentMethod,
//       totalAmount,
//       orderDate,
//       orderUpdateDate,
//       cartId,
//     } = req.body;

//     if (paymentMethod === "cod") {
//       // Tạo đơn hàng COD
//       const newlyCreatedOrder = new Order({
//         userId,
//         cartId,
//         cartItems,
//         addressInfo,
//         orderStatus, // Đơn hàng được xác nhận ngay lập tức
//         paymentMethod,
//         paymentStatus: "pending", // Thanh toán COD sẽ thực hiện khi nhận hàng
//         totalAmount,
//         orderDate,
//         orderUpdateDate,
//       });

//       // console.log(cartId, "đây");

//       await newlyCreatedOrder.save();
//       // Cập nhật giỏ hàng và số lượng sản phẩm
//       for (let item of cartItems) {
//         const product = await Product.findById(item.productId);

//         if (!product) {
//           return res.status(404).json({
//             success: false,
//             message: `Không tìm thấy sản phẩm với ID ${item.productId}`,
//           });
//         }

//         // Tìm màu sắc
//         const color = product.colors.find(
//           (c) => c._id.toString() === item.colorId
//         );
//         if (!color) {
//           return res.status(404).json({
//             success: false,
//             message: `Không tìm thấy màu sắc với ID ${item.colorId} trong sản phẩm ${product.title}`,
//           });
//         }

//         // Tìm kích thước
//         const size = color.sizes.find((s) => s._id.toString() === item.sizeId);
//         if (!size) {
//           return res.status(404).json({
//             success: false,
//             message: `Không tìm thấy kích thước với ID ${item.sizeId} trong màu ${color.name} của sản phẩm ${product.title}`,
//           });
//         }

//         // Kiểm tra số lượng tồn kho
//         if (size.quantity < item.quantity) {
//           return res.status(400).json({
//             success: false,
//             message: `Không đủ hàng tồn kho cho sản phẩm ${product.title}, màu ${color.name}, kích thước ${size.size}`,
//           });
//         }

//         // Cập nhật số lượng tồn kho
//         size.quantity -= item.quantity;

//         // Cập nhật số lượng bán tổng thể của sản phẩm
//         product.sales += item.quantity;

//         product.totalStock -= item.quantity;

//         await product.save();
//       }

//       // Xóa giỏ hàng của người dùng sau khi tạo đơn hàng thành công

//       await Cart.findOneAndDelete(userId);

//       return res.status(201).json({
//         success: true,
//         message: "Đơn hàng COD đã được tạo thành công.",
//         orderId: newlyCreatedOrder._id,
//       });
//     }
//     // Tỷ giá USD/VND
//     const exchangeRate = 25422.5;

//     // Tạo đối tượng cho PayPal
//     // cartItems được chuyển thành danh sách items theo định dạng PayPal yêu cầu
//     const items = cartItems.map((item) => ({
//       name: item.title,
//       // Mã sản phẩm (Product ID).
//       sku: item.productId,
//       price: (item.price / exchangeRate).toFixed(2), // Chuyển sang USD
//       currency: "USD",
//       quantity: item.quantity,
//     }));

//     // Tính toán tổng tiền hàng bằng cách này sẽ không gay ra sự sai khác do làm tròn số
//     // Tính toán subtotal từ items mà không làm tròn từng giá
//     const subtotal = items
//       .reduce((total, item) => {
//         return total + Number(item.price) * item.quantity;
//       }, 0)
//       .toFixed(2); // Lần này chỉ làm tròn khi gửi tới PayPal

//     // Tạo đối tượng create payment cho PayPal
//     const create_payment_json = {
//       // Mục đích thanh toán (ở đây là "sale" - thanh toán trực tiếp).
//       intent: "sale",
//       payer: {
//         payment_method: "paypal",
//       },
//       redirect_urls: {
//         // URL mà người dùng được chuyển tới sau khi thanh toán thành công.
//         return_url: "https://tlcn-deploy-1.onrender.com/shop/paypal-return",
//         // URL mà người dùng được chuyển tới nếu hủy thanh toán.
//         cancel_url: "https://tlcn-deploy-1.onrender.com/shop/paypal-cancel",
//       },

//       // Thông tin chi tiết giao dịch
//       transactions: [
//         {
//           // Danh sách các sản phẩm.
//           item_list: {
//             items: items,
//           },
//           //  Tổng số tiền thanh toán (USD).
//           amount: {
//             currency: "USD",
//             total: subtotal, // Tổng tiền (USD)
//             details: {
//               subtotal: subtotal, // Tổng giá trị hàng hóa
//             },
//           },
//           description: "Đơn hàng của bạn từ cửa hàng BLISS",
//         },
//       ],
//     };

//     // Gửi yêu cầu tạo thanh toán PayPal
//     paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
//       if (error) {
//         console.log("Chi tiết lỗi PayPal:", error.response.details);
//         return res.status(500).json({
//           success: false,
//           message: "Đã xảy ra lỗi khi tạo thanh toán PayPal",
//           details: error.response.details,
//         });
//       } else {
//         // Tạo đối tượng đơn hàng mới
//         const newlyCreatedOrder = new Order({
//           userId,
//           cartId,
//           cartItems,
//           addressInfo,
//           orderStatus,
//           paymentMethod,
//           paymentStatus: "pending",
//           totalAmount, // Giữ nguyên tổng tiền VND
//           orderDate,
//           orderUpdateDate,
//           paymentId: "",
//           payerId: "",
//         });

//         await newlyCreatedOrder.save();

//         //  đường dẫn mà người dùng sẽ được chuyển tới để thực hiện thanh toán.
//         const approvalURL = paymentInfo.links.find(
//           (link) => link.rel === "approval_url"
//         ).href;

//         res.status(201).json({
//           success: true,
//           approvalURL,
//           orderId: newlyCreatedOrder._id,
//         });
//       }
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Đã xảy ra lỗi! Xin thử lại sau.",
//     });
//   }
// };

// const capturePayment = async (req, res) => {
//   try {
//     const { paymentId, payerId, orderId } = req.body;

//     let order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy đơn hàng!",
//       });
//     }

//     order.paymentStatus = "paid";
//     order.paymentId = paymentId;
//     order.payerId = payerId;

//     for (let item of order.cartItems) {
//       const product = await Product.findById(item.productId);

//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: `Không tìm thấy sản phẩm với ID ${item.productId}`,
//         });
//       }

//       // Tìm màu sắc
//       const color = product.colors.find(
//         (c) => c._id.toString() === item.colorId
//       );
//       if (!color) {
//         return res.status(404).json({
//           success: false,
//           message: `Không tìm thấy màu sắc với ID ${item.colorId} trong sản phẩm ${product.title}`,
//         });
//       }

//       // Tìm kích thước
//       const size = color.sizes.find((s) => s._id.toString() === item.sizeId);
//       if (!size) {
//         return res.status(404).json({
//           success: false,
//           message: `Không tìm thấy kích thước với ID ${item.sizeId} trong màu ${color.name} của sản phẩm ${product.title}`,
//         });
//       }

//       // Kiểm tra số lượng tồn kho
//       if (size.quantity < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Không đủ hàng tồn kho cho sản phẩm ${product.title}, màu ${color.name}, kích thước ${size.size}`,
//         });
//       }

//       // Cập nhật số lượng tồn kho
//       size.quantity -= item.quantity;

//       // Cập nhật số lượng bán tổng thể của sản phẩm
//       product.sales += item.quantity;

//       product.totalStock -= item.quantity;

//       await product.save();
//     }

//     // Xóa giỏ hàng sau khi thanh toán thành công

//     // Lấy userId từ order
//     const userId = order.userId;

//     await Cart.findOneAndDelete(userId);

//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: "Đơn hàng thanh toán PayPal đã được tạo thành công.",
//       data: order,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Đã xảy ra lỗi! Xin thử lại sau.",
//     });
//   }
// };

const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    if (paymentMethod === "cod") {
      // Tạo đơn hàng COD
      const newlyCreatedOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus,
        paymentMethod,
        paymentStatus: "pending", // Thanh toán COD sẽ thực hiện khi nhận hàng
        totalAmount,
        orderDate,
        orderUpdateDate,
      });

      await newlyCreatedOrder.save();

      // Xóa giỏ hàng
      await Cart.findOneAndDelete({ userId });

      return res.status(201).json({
        success: true,
        message: "Đơn hàng COD đã được tạo thành công.",
        orderId: newlyCreatedOrder._id,
      });
    }

    // PayPal thanh toán
    const exchangeRate = 25422.5;
    const items = cartItems.map((item) => ({
      name: item.title,
      sku: item.productId,
      price: (item.price / exchangeRate).toFixed(2),
      currency: "USD",
      quantity: item.quantity,
    }));

    const subtotal = items
      .reduce((total, item) => total + Number(item.price) * item.quantity, 0)
      .toFixed(2);

    const create_payment_json = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: "https://tlcn-deploy-1.onrender.com/shop/paypal-return",
        cancel_url: "https://tlcn-deploy-1.onrender.com/shop/paypal-cancel",
      },
      transactions: [
        {
          item_list: { items: items },
          amount: { currency: "USD", total: subtotal, details: { subtotal } },
          description: "Đơn hàng của bạn từ cửa hàng BLISS",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log("PayPal Error:", error);
        return res.status(500).json({ success: false, message: "Lỗi PayPal." });
      } else {
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems,
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus: "pending",
          totalAmount,
          orderDate,
          orderUpdateDate,
        });

        await newlyCreatedOrder.save();

        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        return res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng.",
      });
    }

    paypal.payment.execute(
      paymentId,
      { payer_id: payerId },
      async (error, payment) => {
        if (error) {
          console.log("PayPal Capture Error:", error);
          return res.status(500).json({
            success: false,
            message: "Lỗi xác nhận thanh toán PayPal.",
          });
        } else if (payment.state === "approved") {
          // Cập nhật đơn hàng đã thanh toán
          order.paymentStatus = "paid";
          order.paymentId = paymentId;
          order.payerId = payerId;
          await order.save();

          // Cập nhật kho hàng
          for (let item of order.cartItems) {
            const product = await Product.findById(item.productId);
            if (product) {
              const color = product.colors.find(
                (c) => c._id.toString() === item.colorId
              );
              const size = color?.sizes.find(
                (s) => s._id.toString() === item.sizeId
              );

              if (size && size.quantity >= item.quantity) {
                size.quantity -= item.quantity;
                product.sales += item.quantity;
                product.totalStock -= item.quantity;
                await product.save();
              }
            }
          }

          // Xóa giỏ hàng sau khi thanh toán
          await Cart.findOneAndDelete({ userId: order.userId });

          return res.status(200).json({
            success: true,
            message: "Thanh toán thành công.",
            order: order,
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Thanh toán chưa được xác nhận.",
          });
        }
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xác nhận thanh toán.",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Truy vấn đơn hàng của người dùng và sắp xếp theo ngày mua (orderDate) giảm dần
    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng nào!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi! Xin thử lại sau.",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin đơn hàng
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin đơn hàng!",
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

    // Cập nhật kết quả trả về
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
      message: "Đã xảy ra lỗi! Xin thử lại sau.",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
