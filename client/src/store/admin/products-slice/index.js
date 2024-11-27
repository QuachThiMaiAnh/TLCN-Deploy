import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// const initialState = {
//   isLoading: false,
//   productList: [],
//   product: [],
//   error: null,
// };

const initialState = {
  isLoading: false,
  productList: [],
  totalPages: 0,
  currentPage: 1,
  totalCount: 0,
  product: [],
  error: null,
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5000/api/admin/products/add",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return result?.data;
  }
);

// export const fetchAllProducts = createAsyncThunk(
//   "/products/fetchAllProducts",
//   async () => {
//     const result = await axios.get(
//       "http://localhost:5000/api/admin/products/get"
//     );

//     return result?.data;
//   }
// );

// Thêm phân trang vào fetchAllProducts
export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ page = 1, pageSize = 10 }) => {
    const result = await axios.get(
      `http://localhost:5000/api/admin/products/get?page=${page}&pageSize=${pageSize}`
    );
    return result?.data;
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  // {id}= req.param
  async ({ id, formData }) => {
    const result = await axios.put(
      `http://localhost:5000/api/admin/products/edit/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return result?.data;
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/products/delete/${id}`
    );

    return result?.data;
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      // .addCase(fetchAllProducts.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   state.productList = action.payload.data;
      // })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.totalPages = action.payload.totalPages; // Lưu tổng số trang
        state.currentPage = action.payload.currentPage; // Lưu trang hiện tại
        state.totalCount = action.payload.totalProducts; // Lưu tổng số sản phẩm
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.response?.data?.message || "Đã xảy ra lỗi";
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload.success ? action.payload.user : null;
      });
  },
});

export default AdminProductsSlice.reducer;
