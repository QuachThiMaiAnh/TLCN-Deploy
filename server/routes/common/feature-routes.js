const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
  deleteAllFeatureImages,
} = require("../../controllers/common/feature-controller");

const router = express.Router();

router.post("/add", addFeatureImage);
router.get("/get", getFeatureImages);
router.post("/delete", deleteFeatureImage); // Xóa 1 hình ảnh
router.delete("/delete-all", deleteAllFeatureImages); // Xóa tất cả hình ảnh

module.exports = router;
