import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  totalPages: 0,
  currentPage: 1,
  totalCount: 0,
  product: null,
  error: null,
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData, { rejectWithValue }) => {
    try {
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
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

// export const fetchAllProducts = createAsyncThunk(
//   "/products/fetchAllProducts",
//   async ({ page = 1, pageSize = 10 }, { rejectWithValue }) => {
//     try {
//       const result = await axios.get(
//         `http://localhost:5000/api/admin/products/get?page=${page}&pageSize=${pageSize}`
//       );
//       return result?.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
//     }
//   }
// );

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async (
    { page = 1, pageSize = 10, category, brand, search },
    { rejectWithValue }
  ) => {
    try {
      const result = await axios.get(
        `http://localhost:5000/api/admin/products/get`,
        {
          params: {
            page,
            pageSize,
            category,
            brand,
            search,
          },
        }
      );
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
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
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const result = await axios.delete(
        `http://localhost:5000/api/admin/products/delete/${id}`
      );
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data || [];
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalCount = action.payload.totalProducts || 0;
        state.error = null;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.payload || "Đã xảy ra lỗi";
      })

      // Add new product
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload.data || null;
        state.error = null;
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Đã xảy ra lỗi";
      })

      // Edit product
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload.data || null;
        state.error = null;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Đã xảy ra lỗi";
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Đã xảy ra lỗi";
      });
  },
});

export default AdminProductsSlice.reducer;
