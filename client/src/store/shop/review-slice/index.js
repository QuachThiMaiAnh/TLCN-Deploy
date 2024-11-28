import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reviews: [],
  error: null, // Chứa thông báo lỗi từ API
};

export const addReview = createAsyncThunk(
  "/order/addReview",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/shop/review/add`,
        formData
      );
      return response.data;
    } catch (error) {
      // Trả về thông báo lỗi từ API (nếu có)
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

export const getReviews = createAsyncThunk(
  "/order/getReviews",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/review/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null; // Reset lỗi về rỗng
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Xóa lỗi cũ trước khi gọi API mới
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews.push(action.payload.data); // Thêm đánh giá mới
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Lưu lỗi từ API
      })
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Xóa lỗi cũ trước khi gọi API mới
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data; // Lưu danh sách đánh giá
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Lưu lỗi từ API
      });
  },
});

export const { clearError } = reviewSlice.actions; // Export action
export default reviewSlice.reducer;
