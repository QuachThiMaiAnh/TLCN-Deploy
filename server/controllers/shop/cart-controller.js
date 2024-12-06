const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, colorId, sizeId, quantity } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Người dùng chưa đăng nhập!",
      });
    }

    if (!productId || !colorId || !sizeId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu được cung cấp không hợp lệ!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm!",
      });
    }

    // Kiểm tra màu sắc và kích thước có tồn tại trong sản phẩm
    const colorOption = product.colors.find(
      (c) => c._id.toString() === colorId
    );
    if (!colorOption) {
      return res.status(404).json({
        success: false,
        message: "Màu sắc không hợp lệ!",
      });
    }
    const sizeOption = colorOption.sizes.find(
      (s) => s._id.toString() === sizeId
    );
    if (!sizeOption) {
      return res.status(404).json({
        success: false,
        message: "Kích thước không hợp lệ!",
      });
    }

    let cart = await Cart.findOne({ userId });

    // Tạo giỏ hàng nếu chưa tồn tại
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Kiểm tra và thêm sản phẩm vào giỏ hàng

    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.colorId.toString() === colorId &&
        item.sizeId.toString() === sizeId
    );

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, colorId, sizeId, quantity });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();
    // Populate dữ liệu sản phẩm mới thêm vào
    const addedItem =
      cart.items[
        findCurrentProductIndex === -1
          ? cart.items.length - 1
          : findCurrentProductIndex
      ];
    const populatedItem = await Product.findById(addedItem.productId)
      .populate("colors.sizes")
      .select("images title price salePrice colors");

    const color = populatedItem.colors.find(
      (c) => c._id.toString() === addedItem.colorId
    );
    const size = color?.sizes.find(
      (s) => s._id.toString() === addedItem.sizeId
    );

    // Format lại dữ liệu sản phẩm
    const formattedItem = {
      productId: populatedItem._id,
      images: color?.image || populatedItem.images?.[0],
      title: populatedItem.title,
      price: populatedItem.price,
      salePrice: populatedItem.salePrice,
      colorId: addedItem.colorId,
      colorName: color ? color.name : "Không xác định",
      sizeId: addedItem.sizeId,
      sizeName: size ? size.size : "Không xác định",
      quantity: addedItem.quantity,
    };

    res.status(200).json({
      success: true,
      data: formattedItem,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng là bắt buộc!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "images title price salePrice colors", // Kiểm tra rằng colors được load đầy đủ
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng!",
      });
    }

    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populateCartItems = validItems.map((item) => {
      // Tìm màu sắc trong danh sách colors dựa trên colorId
      const color = item.productId.colors.find(
        (color) => color._id.equals(item.colorId) // So sánh ObjectId đúng cách
      );

      // Nếu không tìm thấy màu sắc, fallback về giá trị mặc định
      const colorName = color ? color.name : "Không xác định";
      const colorImage = color ? color.image : item.productId.images?.[0];

      // Tìm kích thước từ mảng sizes của màu sắc
      const size = color?.sizes?.find(
        (size) => size._id.equals(item.sizeId) // So sánh ObjectId kích thước
      );

      const sizeName = size ? size.size : "Không xác định";

      return {
        productId: item.productId._id,
        images: colorImage,
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        colorId: item.colorId,
        colorName: colorName, // In ra tên màu sắc
        sizeId: item.sizeId,
        sizeName: sizeName, // In ra tên kích thước
        quantity: item.quantity,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, colorId, sizeId, quantity } = req.body;

    if (!userId || !productId || !colorId || !sizeId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu được cung cấp không hợp lệ!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.colorId.toString() === colorId &&
        item.sizeId.toString() === sizeId
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Không có sản phẩm trong giỏ hàng!",
      });
    }

    // Cập nhật số lượng sản phẩm
    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    // Populate dữ liệu sản phẩm
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "images title price salePrice colors",
    });

    // Format lại dữ liệu trả về
    const formattedItems = populatedCart.items.map((item) => {
      const color = item.productId.colors.find((c) =>
        c._id.equals(item.colorId)
      );
      const size = color?.sizes.find((s) => s._id.equals(item.sizeId));

      return {
        productId: item.productId._id,
        images: color?.image || item.productId.images?.[0],
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        colorId: item.colorId,
        colorName: color ? color.name : "Không xác định",
        sizeId: item.sizeId,
        sizeName: size ? size.size : "Không xác định",
        quantity: item.quantity,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...populatedCart._doc,
        items: formattedItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const {
      userId,
      productId,
      colorId,
      sizeId,
      newColorId,
      newSizeId,
      newQuantity,
    } = req.body;

    if (
      !userId ||
      !productId ||
      !colorId ||
      !sizeId ||
      !newColorId ||
      !newSizeId ||
      newQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu được cung cấp không hợp lệ!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng!",
      });
    }

    // Tìm sản phẩm hiện tại
    const currentIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.colorId.toString() === colorId &&
        item.sizeId.toString() === sizeId
    );

    if (currentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại trong giỏ hàng!",
      });
    }

    // Xóa sản phẩm hiện tại
    const currentItem = cart.items[currentIndex];
    cart.items.splice(currentIndex, 1);

    // Kiểm tra nếu sản phẩm mới đã tồn tại trong giỏ hàng
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.colorId.toString() === newColorId &&
        item.sizeId.toString() === newSizeId
    );

    if (existingIndex !== -1) {
      // Cộng dồn số lượng nếu sản phẩm mới đã tồn tại
      cart.items[existingIndex].quantity += newQuantity;
    } else {
      // Thêm sản phẩm mới với thuộc tính được cập nhật
      cart.items.push({
        productId,
        colorId: newColorId,
        sizeId: newSizeId,
        quantity: newQuantity,
      });
    }

    await cart.save();

    // Populate dữ liệu sản phẩm
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "images title price salePrice colors",
    });

    // Format lại dữ liệu trả về
    const formattedItems = populatedCart.items.map((item) => {
      const color = item.productId.colors.find((c) =>
        c._id.equals(item.colorId)
      );
      const size = color?.sizes.find((s) => s._id.equals(item.sizeId));

      return {
        productId: item.productId._id,
        images: color?.image || item.productId.images?.[0],
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        colorId: item.colorId,
        colorName: color ? color.name : "Không xác định",
        sizeId: item.sizeId,
        sizeName: size ? size.size : "Không xác định",
        quantity: item.quantity,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...populatedCart._doc,
        items: formattedItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId, colorId, sizeId } = req.params;
    // console.log(userId, productId, colorId, sizeId);

    if (!userId || !productId || !colorId || !sizeId) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu được cung cấp không hợp lệ!",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng!",
      });
    }

    // Sử dụng .equals() để so sánh các ObjectId
    cart.items = cart.items.filter(
      (item) =>
        !(
          (
            item.productId.toString() === productId && // Sử dụng .equals() cho ObjectId
            item.colorId.toString() === colorId && // Nếu colorId là ObjectId, dùng .equals()
            item.sizeId.toString() === sizeId
          ) // Nếu sizeId là ObjectId, dùng .equals()
        )
    );

    await cart.save();

    // Populate dữ liệu sản phẩm
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "images title price salePrice colors",
    });

    // Format lại dữ liệu trả về
    const formattedItems = populatedCart.items.map((item) => {
      const color = item.productId.colors.find((c) =>
        c._id.equals(item.colorId)
      );
      const size = color?.sizes.find((s) => s._id.equals(item.sizeId));

      return {
        productId: item.productId._id,
        images: color?.image || item.productId.images?.[0],
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        colorId: item.colorId,
        colorName: color ? color.name : "Không xác định",
        sizeId: item.sizeId,
        sizeName: size ? size.size : "Không xác định",
        quantity: item.quantity,
      };
    });

    res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ hàng!",
      data: {
        ...populatedCart._doc,
        items: formattedItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    // console.log(userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng là bắt buộc!",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng!",
      });
    }

    // Xóa toàn bộ sản phẩm trong giỏ hàng
    cart.items = [];
    await cart.save();

    // Populate dữ liệu sản phẩm
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "images title price salePrice colors",
    });

    // Format lại dữ liệu trả về
    res.status(200).json({
      success: true,
      message: "Giỏ hàng đã được làm trống!",
      data: {
        ...populatedCart._doc,
        items: [],
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItemQty,
  updateCartItem,
  deleteCartItem,
  clearCart,
};
