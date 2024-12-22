import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  userList: [],
  userDetail: null,
  error: null,
};

// Lấy danh sách người dùng với phân trang
export const getUsersWithPagination = createAsyncThunk(
  "/user/getUsersWithPagination",
  async ({ page = 1, limit = 10 }) => {
    const response = await axios.get(
      `https://tlcn-deploy-1.onrender.com/api/user`,
      { params: { page, limit } }
    );
    return response.data;
  }
);

// Lấy thông tin một người dùng
export const getUserById = createAsyncThunk("/user/getUserById", async (id) => {
  const response = await axios.get(
    `https://tlcn-deploy-1.onrender.com/api/user/${id}`
  );
  return response.data;
});

// Cập nhật trạng thái người dùng
export const updateUserStatus = createAsyncThunk(
  "/user/updateUserStatus",
  async ({ id, status }) => {
    const response = await axios.put(
      `https://tlcn-deploy-1.onrender.com/api/user/${id}/status`,
      { status }
    );
    return response.data;
  }
);

// Đổi mật khẩu người dùng
export const changePassword = createAsyncThunk(
  "/user/changePassword",
  async ({ id, oldPassword, newPassword }) => {
    const response = await axios.put(
      `https://tlcn-deploy-1.onrender.com/api/user/${id}/password`,
      { oldPassword, newPassword }
    );
    return response.data;
  }
);

// Xóa một người dùng
export const deleteUser = createAsyncThunk("/user/deleteUser", async (id) => {
  const response = await axios.delete(
    `https://tlcn-deploy-1.onrender.com/api/user/${id}`
  );
  return response.data;
});

// Slice cho user
const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Lấy danh sách người dùng
      .addCase(getUsersWithPagination.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsersWithPagination.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userList = action.payload.users;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getUsersWithPagination.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Lấy thông tin một người dùng
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDetail = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Cập nhật trạng thái người dùng
      .addCase(updateUserStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { id, status } = action.meta.arg;
        const user = state.userList.find((u) => u._id === id);
        if (user) {
          user.status = status;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Đổi mật khẩu người dùng
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDetail = action.payload.user; // Cập nhật thông tin người dùng nếu đổi mật khẩu thành công
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Xóa người dùng
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userList = state.userList.filter(
          (user) => user._id !== action.meta.arg
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
