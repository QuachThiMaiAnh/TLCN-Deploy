// import axios from "axios";
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const initialState = {
//   cartItems: [],
//   isLoading: false,
//   error: null, // Chứa thông báo lỗi từ API
// };

// export const addToCart = createAsyncThunk(
//   "cart/addToCart",
//   async ({ userId, productId, quantity }) => {
//     const response = await axios.post(
//       "http://localhost:5000/api/shop/cart/add",
//       {
//         userId,
//         productId,
//         quantity,
//       }
//     );

//     return response.data;
//   }
// );

// export const fetchCartItems = createAsyncThunk(
//   "cart/fetchCartItems",
//   async (userId) => {
//     const response = await axios.get(
//       `http://localhost:5000/api/shop/cart/get/${userId}`
//     );

//     return response.data;
//   }
// );

// export const deleteCartItem = createAsyncThunk(
//   "cart/deleteCartItem",
//   async ({ userId, productId }) => {
//     const response = await axios.delete(
//       `http://localhost:5000/api/shop/cart/${userId}/${productId}`
//     );

//     return response.data;
//   }
// );

// export const updateCartQuantity = createAsyncThunk(
//   "cart/updateCartQuantity",
//   async ({ userId, productId, quantity }) => {
//     const response = await axios.put(
//       "http://localhost:5000/api/shop/cart/update-cart",
//       {
//         userId,
//         productId,
//         quantity,
//       }
//     );

//     return response.data;
//   }
// );

// const shoppingCartSlice = createSlice({
//   name: "shoppingCart",
//   initialState,
//   reducers: {
//     clearError(state) {
//       state.error = null; // Reset lỗi về rỗng
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(addToCart.pending, (state) => {
//         state.isLoading = true;
//         state.error = null; // Xóa lỗi cũ trước khi gọi API mới
//       })
//       .addCase(addToCart.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(addToCart.rejected, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = [];
//         state.error = action.payload; // Lưu lỗi từ API
//         console.log(action.payload);
//       })
//       .addCase(fetchCartItems.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchCartItems.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(fetchCartItems.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       })
//       .addCase(updateCartQuantity.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(updateCartQuantity.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(updateCartQuantity.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       })
//       .addCase(deleteCartItem.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(deleteCartItem.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(deleteCartItem.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       });
//   },
// });

// export const { clearError } = shoppingCartSlice.actions;
// export default shoppingCartSlice.reducer;

import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  isLoading: false,
  error: null, // Chứa thông báo lỗi từ API
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/cart/add",
        {
          userId,
          productId,
          quantity,
        }
      );
      return response.data;
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
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/shop/cart/${userId}/${productId}`
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
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/shop/cart/update-cart",
        {
          userId,
          productId,
          quantity,
        }
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
      state.error = null; // Reset lỗi về rỗng
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý thêm sản phẩm vào giỏ hàng
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Xóa lỗi cũ trước khi gọi API mới
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Lưu lỗi từ API
        console.error("Lỗi từ API:", action.payload);
      })

      // Xử lý lấy danh sách giỏ hàng
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        // state.error = action.payload;
        state.cartItems = [];
      })

      // Xử lý cập nhật số lượng sản phẩm
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Xử lý xóa sản phẩm khỏi giỏ hàng
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
