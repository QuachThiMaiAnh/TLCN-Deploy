import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
  deleteAllFeatureImages,
} from "../../store/common";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminFeatures() {
  const [imageFiles, setImageFiles] = useState(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  // Upload Feature Image
  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrls)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFiles(null);
        setUploadedImageUrls([]);
      }
    });
  }

  // Delete single image
  function handleDeleteFeatureImage(id, imageUrl) {
    dispatch(deleteFeatureImage({ id, imageUrl })).then(() => {
      dispatch(getFeatureImages());
    });
  }

  // Delete all images
  function handleDeleteAllFeatureImages() {
    dispatch(deleteAllFeatureImages()).then(() => {
      dispatch(getFeatureImages());
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div>
      <div className="flex flex-col items-center">
        {/* Image Upload Component */}
        <ProductImageUpload
          imageFiles={imageFiles}
          setImageFiles={setImageFiles}
          uploadedImageUrls={uploadedImageUrls}
          setUploadedImageUrls={setUploadedImageUrls}
          setImageLoadingState={setImageLoadingState}
          imageLoadingState={imageLoadingState}
          isCustomStyling={true}
        />

        <div className="flex justify-center gap-4 w-1/3">
          <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
            Tải banner lên
          </Button>

          {/* Delete All Images Button */}
          <Button
            onClick={handleDeleteAllFeatureImages}
            className="mt-5 w-full bg-red-700 text-white hover:bg-red-500"
          >
            Xóa toàn bộ banner
          </Button>
        </div>
      </div>

      {/* Display Feature Images */}
      <div className="flex flex-col gap-4 mt-5">
        {featureImageList && featureImageList.length > 0 ? (
          featureImageList.map((featureItem) => (
            <div key={featureItem._id} className="flex flex-col gap-4">
              {/* Display each image with a delete button */}
              {featureItem.images.map((imageUrl, index) => (
                <div key={`${featureItem._id}-${index}`} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Feature Image ${index + 1}`}
                    className="w-full h-[300px] object-cover rounded-lg"
                  />
                  <Button
                    onClick={() =>
                      handleDeleteFeatureImage(featureItem._id, imageUrl)
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>Chưa có banner nào!</p>
        )}
      </div>
    </div>
  );
}

export default AdminFeatures;
