import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};
// Gọi All API trong file này!!

// API đăng ký tài khoản
/**
 * createAsyncThunk hỗ trợ việc tạo và quản lý các trạng thái như
 * pending, fulfilled, và rejected để dễ dàng theo dõi trạng thái của hành động.
 */
/**
 * createAsyncThunk tạo ra một thunk action bất đồng bộ,
 * giúp xử lý các yêu cầu đến server một cách dễ dàng và tự động cập nhật trạng thái Redux
 */
export const registerUser = createAsyncThunk(
  "/auth/register",

  async (formData) => {
    // axios.post() thực hiện một yêu cầu POST đến endpoint "http://localhost:5000/api/auth/register" để đăng ký tài khoản.
    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      formData,
      {
        /**
         * withCredentials: true là cần thiết khi làm việc với các tài nguyên yêu cầu xác thực hoặc bảo mật,
         * nhất là trong các ứng dụng dùng token hoặc cookie.
         */
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",

  async (formData) => {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      formData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",

  async () => {
    const response = await axios.post(
      "http://localhost:5000/api/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",

  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/auth/check-auth",
      {
        withCredentials: true,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );

    return response.data;
  }
);

// triển khai các trạng thái trong reducer
// Khi  được gọi và thành công, kết quả này sẽ được chuyển tới reducer và cập nhật vào Redux store,
// giúp ứng dụng có thể dễ dàng sử dụng dữ liệu từ phản hồi của server.
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log(action);
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
// Cập nhật lại trạng thái của state
// Action: chứa thông tin về hành động được dispatch, bao gồm type (loại hành động) và payload (dữ liệu mà hành động mang theo).
export const { setUser } = authSlice.actions;
