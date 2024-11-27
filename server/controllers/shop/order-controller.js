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
//       paymentStatus,
//       totalAmount,
//       orderDate,
//       orderUpdateDate,
//       paymentId,
//       payerId,
//       cartId,
//     } = req.body;

//     // const create_payment_json = {
//     //   intent: "sale",
//     //   payer: {
//     //     payment_method: "paypal",
//     //   },
//     //   redirect_urls: {
//     //     return_url: "http://localhost:5173/shop/paypal-return",
//     //     cancel_url: "http://localhost:5173/shop/paypal-cancel",
//     //   },
//     //   transactions: [
//     //     {
//     //       item_list: {
//     //         items: cartItems.map((item) => ({
//     //           name: item.title,
//     //           sku: item.productId,
//     //           price: item.price.toFixed(0), // Giữ giá trị dạng số nguyên (VND không có thập phân)
//     //           currency: "VND",
//     //           quantity: item.quantity,
//     //         })),
//     //       },
//     //       amount: {
//     //         currency: "VND",
//     //         total: totalAmount.toFixed(0), // Tổng tiền cũng dùng số nguyên
//     //       },
//     //       description: "Đơn hàng của bạn từ cửa hàng BLISS",
//     //     },
//     //   ],
//     // };

//     // Tính toán tổng giá trị trong VND
//     let calculatedTotalAmount = cartItems.reduce((total, item) => {
//       return total + item.price * item.quantity;
//     }, 0);

//     // Chuyển đổi tổng từ VND sang USD
//     const exchangeRate = 23000; // Tỷ giá USD/VND
//     const totalInUSD = calculatedTotalAmount / exchangeRate;

//     // Rà soát xem giá trị đã khớp với totalAmount không
//     if (totalInUSD.toFixed(2) !== totalAmount.toFixed(2)) {
//       console.log(
//         "Total amount mismatch. Calculated:",
//         totalInUSD,
//         "Specified:",
//         totalAmount
//       );
//       return res.status(400).json({
//         success: false,
//         message: "Total amount mismatch.",
//       });
//     }

//     // Update create_payment_json
//     const create_payment_json = {
//       intent: "sale",
//       payer: {
//         payment_method: "paypal",
//       },
//       redirect_urls: {
//         return_url: "http://localhost:5173/shop/paypal-return",
//         cancel_url: "http://localhost:5173/shop/paypal-cancel",
//       },
//       transactions: [
//         {
//           item_list: {
//             items: cartItems.map((item) => ({
//               name: item.title,
//               sku: item.productId,
//               price: (item.price / exchangeRate).toFixed(2), // Chuyển từ VND sang USD
//               currency: "USD",
//               quantity: item.quantity,
//             })),
//           },
//           amount: {
//             currency: "USD",
//             total: totalInUSD.toFixed(2), // Tổng số tiền tính bằng USD
//           },
//           description: "Đơn hàng của bạn từ cửa hàng BLISS",
//         },
//       ],
//     };

//     paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
//       if (error) {
//         // In chi tiết lỗi từ PayPal
//         console.log("PayPal Error Details:", error.response.details);

//         return res.status(500).json({
//           success: false,
//           message: "Error while creating PayPal payment",
//           details: error.response.details, // Trả chi tiết lỗi về cho client nếu cần
//         });
//       } else {
//         const newlyCreatedOrder = new Order({
//           userId,
//           cartId,
//           cartItems,
//           addressInfo,
//           orderStatus,
//           paymentMethod,
//           paymentStatus,
//           totalAmount,
//           orderDate,
//           orderUpdateDate,
//           paymentId,
//           payerId,
//         });

//         await newlyCreatedOrder.save();

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
        orderStatus: "confirmed", // Đơn hàng được xác nhận ngay lập tức
        paymentMethod,
        paymentStatus: "pending", // Thanh toán COD sẽ thực hiện khi nhận hàng
        totalAmount,
        orderDate,
        orderUpdateDate,
      });

      await newlyCreatedOrder.save();
      // Cập nhật giỏ hàng và số lượng sản phẩm
      for (let item of cartItems) {
        const product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy sản phẩm với ID ${item.productId}`,
          });
        }

        // Kiểm tra và cập nhật số lượng tồn kho sản phẩm
        if (product.totalStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Không đủ hàng tồn kho cho sản phẩm ${product.title}`,
          });
        }

        // Giảm số lượng tồn kho và tăng số lượng bán
        product.totalStock -= item.quantity;
        product.sales += item.quantity;

        await product.save();
      }

      // Xóa giỏ hàng của người dùng sau khi tạo đơn hàng thành công
      await Cart.findByIdAndDelete(cartId);

      return res.status(201).json({
        success: true,
        message: "Đơn hàng COD đã được tạo thành công.",
        orderId: newlyCreatedOrder._id,
      });
    }
    // Tỷ giá USD/VND
    const exchangeRate = 25422.5;

    // Tạo đối tượng cho PayPal
    // cartItems được chuyển thành danh sách items theo định dạng PayPal yêu cầu
    const items = cartItems.map((item) => ({
      name: item.title,
      // Mã sản phẩm (Product ID).
      sku: item.productId,
      price: (item.price / exchangeRate).toFixed(2), // Chuyển sang USD
      currency: "USD",
      quantity: item.quantity,
    }));

    // Tính toán tổng tiền hàng bằng cách này sẽ không gay ra sự sai khác do làm tròn số
    // Tính toán subtotal từ items mà không làm tròn từng giá
    const subtotal = items
      .reduce((total, item) => {
        return total + Number(item.price) * item.quantity;
      }, 0)
      .toFixed(2); // Lần này chỉ làm tròn khi gửi tới PayPal

    // Tạo đối tượng create payment cho PayPal
    const create_payment_json = {
      // Mục đích thanh toán (ở đây là "sale" - thanh toán trực tiếp).
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        // URL mà người dùng được chuyển tới sau khi thanh toán thành công.
        return_url: "http://localhost:5173/shop/paypal-return",
        // URL mà người dùng được chuyển tới nếu hủy thanh toán.
        cancel_url: "http://localhost:5173/shop/paypal-cancel",
      },
      // Thông tin chi tiết giao dịch
      transactions: [
        {
          // Danh sách các sản phẩm.
          item_list: {
            items: items,
          },
          //  Tổng số tiền thanh toán (USD).
          amount: {
            currency: "USD",
            total: subtotal, // Tổng tiền (USD)
            details: {
              subtotal: subtotal, // Tổng giá trị hàng hóa
            },
          },
          description: "Đơn hàng của bạn từ cửa hàng BLISS",
        },
      ],
    };

    // Gửi yêu cầu tạo thanh toán PayPal
    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log("Chi tiết lỗi PayPal:", error.response.details);
        return res.status(500).json({
          success: false,
          message: "Đã xảy ra lỗi khi tạo thanh toán PayPal",
          details: error.response.details,
        });
      } else {
        // Tạo đối tượng đơn hàng mới
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems,
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus: "pending",
          totalAmount, // Giữ nguyên tổng tiền VND
          orderDate,
          orderUpdateDate,
          paymentId: "",
          payerId: "",
        });

        await newlyCreatedOrder.save();

        //  đường dẫn mà người dùng sẽ được chuyển tới để thực hiện thanh toán.
        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi! Xin thử lại sau.",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Không đủ hàng tồn kho cho sản phẩm ${product?.title || ""}`,
        });
      }

      // cập nhật lại số lượng sản phẩm tồn kho
      product.totalStock -= item.quantity;
      product.sales += item.quantity;

      await product.save();
    }

    // Xóa giỏ hàng sau khi thanh toán thành công
    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Đơn hàng đã được xác nhận!",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi! Xin thử lại sau.",
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

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin đơn hàng!",
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
