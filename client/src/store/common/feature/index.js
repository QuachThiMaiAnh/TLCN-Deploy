import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
};

export const getFeatureImages = createAsyncThunk(
  "/order/getFeatureImages",
  async () => {
    const response = await axios.get(
      `https://tlcn-deploy-1.onrender.com/api/common/feature/get`
    );

    return response.data;
  }
);

export const addFeatureImage = createAsyncThunk(
  "/order/addFeatureImage",
  async (images) => {
    const response = await axios.post(
      `https://tlcn-deploy-1.onrender.com/api/common/feature/add`,
      { images }
    );

    return response.data;
  }
);

export const deleteFeatureImage = createAsyncThunk(
  "/order/deleteFeatureImage",
  async ({ id, imageUrl }) => {
    const response = await axios.post(
      `https://tlcn-deploy-1.onrender.com/api/common/feature/delete`,
      { id, imageUrl }
    );

    return response.data;
  }
);

export const deleteAllFeatureImages = createAsyncThunk(
  "/order/deleteAllFeatureImages",
  async () => {
    const response = await axios.delete(
      `https://tlcn-deploy-1.onrender.com/api/common/feature/delete-all`
    );

    return response.data;
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Get Feature Images
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      })

      // Delete One Feature Image
      .addCase(deleteFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        const { id, imageUrl } = action.meta.arg;

        // Tìm document theo ID và cập nhật danh sách images
        const feature = state.featureImageList.find((item) => item._id === id);
        if (feature) {
          feature.images = feature.images.filter((url) => url !== imageUrl);
        }
      })
      .addCase(deleteFeatureImage.rejected, (state) => {
        state.isLoading = false;
      })

      // Delete All Feature Images
      .addCase(deleteAllFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAllFeatureImages.fulfilled, (state) => {
        state.isLoading = false;
        state.featureImageList = []; // Xóa toàn bộ danh sách ảnh
      })
      .addCase(deleteAllFeatureImages.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default commonSlice.reducer;
