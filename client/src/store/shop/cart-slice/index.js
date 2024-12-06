import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [], // Danh sách sản phẩm trong giỏ hàng
  isLoading: false, // Trạng thái đang tải
  error: null, // Lưu thông báo lỗi từ API
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { userId, productId, colorId, sizeId, quantity },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/cart/add",
        {
          userId,
          productId,
          colorId,
          sizeId,
          quantity,
        }
      );
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// Lấy danh sách giỏ hàng
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/cart/get/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// Xóa sản phẩm khỏi giỏ hàng
export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, colorId, sizeId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/shop/cart/${userId}/${productId}/${colorId}/${sizeId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async (
    { userId, productId, colorId, sizeId, quantity },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/shop/cart/update-cart",
        {
          userId,
          productId,
          colorId,
          sizeId,
          quantity,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// Cập nhật sản phẩm trong giỏ hàng (bao gồm màu sắc, kích thước, số lượng)
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (
    {
      userId,
      productId,
      oldColorId,
      oldSizeId,
      newColorId,
      newSizeId,
      quantity,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/shop/cart/update-item",
        {
          userId,
          productId,
          oldColorId,
          oldSizeId,
          newColorId,
          newSizeId,
          quantity,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// Xóa toàn bộ giỏ hàng
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/shop/cart/clear/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// Slice quản lý giỏ hàng
const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null; // Xóa lỗi
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý thêm sản phẩm vào giỏ hàng
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data.items; // Cập nhật danh sách giỏ hàng
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Xử lý lấy danh sách giỏ hàng
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data.items; // Cập nhật danh sách giỏ hàng
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Xử lý cập nhật số lượng sản phẩm
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data.items; // Cập nhật danh sách giỏ hàng
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Xử lý cập nhật sản phẩm trong giỏ hàng
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data.items; // Cập nhật danh sách giỏ hàng
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Xử lý xóa sản phẩm khỏi giỏ hàng
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data.items; // Cập nhật danh sách giỏ hàng
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Xử lý xóa toàn bộ giỏ hàng
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = []; // Đặt giỏ hàng rỗng
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
