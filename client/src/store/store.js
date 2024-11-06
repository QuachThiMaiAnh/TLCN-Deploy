import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
// Redux Store là một kho lưu trữ trung tâm trong Redux, nơi chứa toàn bộ trạng thái của ứng dụng.

// Lưu trữ toàn bộ trạng thái của auth
const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsSlice,
  },
});

export default store;
