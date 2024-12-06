const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    images: [],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", FeatureSchema);
