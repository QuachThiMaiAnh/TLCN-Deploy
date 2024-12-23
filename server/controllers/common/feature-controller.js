const Feature = require("../../models/Feature");

const addFeatureImage = async (req, res) => {
  try {
    const { images } = req.body;

    console.log(images, "image");

    const featureImages = new Feature({
      images,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};


const getFeatureImages = async (req, res) => {
  try {
    // Sắp xếp theo `createdAt` giảm dần (-1)
    const images = await Feature.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const deleteFeatureImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.body;

    const feature = await Feature.findById(id);
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found!",
      });
    }

    // Lọc bỏ URL ảnh cần xóa
    feature.images = feature.images.filter((url) => url !== imageUrl);

    await feature.save();

    res.status(200).json({
      success: true,
      data: feature,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const deleteAllFeatureImages = async (req, res) => {
  try {
    await Feature.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All feature images deleted successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
  deleteAllFeatureImages,
};
