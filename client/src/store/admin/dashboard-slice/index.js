import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  revenueStatistics: { todayRevenue: 0, revenueByTimePeriod: [] }, // Thêm doanh thu ngày hôm nay
  orderStatistics: { orderStats: [], totalOrders: 0, todayTotalOrders: 0 }, // Thêm tổng đơn hàng hôm nay
  inventoryStatistics: [], // Danh sách sản phẩm tồn kho
  soldProductStatistics: [], // Danh sách sản phẩm đã bán
  error: null,
};

// Fetch revenue statistics
export const fetchRevenueStatistics = createAsyncThunk(
  "statistics/fetchRevenue",
  async (params, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        "http://localhost:5000/api/admin/statistics/revenue",
        { params }
      );
      return result?.data?.data; // Dữ liệu bao gồm: todayRevenue, revenueByTimePeriod
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// Fetch order statistics
export const fetchOrderStatistics = createAsyncThunk(
  "statistics/fetchOrders",
  async (params, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        "http://localhost:5000/api/admin/statistics/orders",
        { params }
      );
      return result?.data?.data; // Dữ liệu bao gồm: orderStats, totalOrders, todayTotalOrders
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// Fetch inventory statistics
export const fetchInventoryStatistics = createAsyncThunk(
  "statistics/fetchInventory",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        "http://localhost:5000/api/admin/statistics/inventory"
      );
      return result?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// Fetch sold product statistics
export const fetchSoldProductStatistics = createAsyncThunk(
  "statistics/fetchSoldProducts",
  async (params, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        "http://localhost:5000/api/admin/statistics/sold-products",
        { params }
      );
      return result?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

const adminStatisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch revenue statistics
      .addCase(fetchRevenueStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueStatistics.todayRevenue = action.payload.todayRevenue; // Doanh thu hôm nay
        state.revenueStatistics.revenueByTimePeriod =
          action.payload.revenueByTimePeriod; // Doanh thu theo khoảng thời gian
        state.error = null;
      })
      .addCase(fetchRevenueStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Đã xảy ra lỗi";
      })

      // Fetch order statistics
      .addCase(fetchOrderStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderStatistics.orderStats = action.payload.orderStats; // Thống kê trạng thái
        state.orderStatistics.totalOrders = action.payload.totalOrders; // Tổng đơn hàng
        state.orderStatistics.todayTotalOrders =
          action.payload.todayTotalOrders; // Tổng đơn hàng hôm nay
        state.error = null;
      })
      .addCase(fetchOrderStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Đã xảy ra lỗi";
      })

      // Fetch inventory statistics
      .addCase(fetchInventoryStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryStatistics = action.payload;
        state.error = null;
      })
      .addCase(fetchInventoryStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Đã xảy ra lỗi";
      })

      // Fetch sold product statistics
      .addCase(fetchSoldProductStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSoldProductStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.soldProductStatistics = action.payload;
        state.error = null;
      })
      .addCase(fetchSoldProductStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Đã xảy ra lỗi";
      });
  },
});

export default adminStatisticsSlice.reducer;
