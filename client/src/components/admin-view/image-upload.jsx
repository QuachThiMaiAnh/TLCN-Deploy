import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFiles,
  setImageFiles,

  imageLoadingState,
  setImageLoadingState,

  uploadedImageUrls,
  setUploadedImageUrls,
}) {
  const inputRef = useRef(null);

  // Xử lý khi thay đổi hình ảnh
  function handleImageFileChange(event) {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      setImageFiles(selectedFiles); // Lưu FileList vào state
    }
  }

  // Xử lý drag & drop
  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setImageFiles(droppedFiles);
    }
  }

  // Xử lý xóa ảnh mới (trong imageFiles)
  function handleRemoveImage(index) {
    const dataTransfer = new DataTransfer();
    Array.from(imageFiles).forEach((file, i) => {
      if (i !== index) {
        dataTransfer.items.add(file);
      }
    });
    setImageFiles(dataTransfer.files.length > 0 ? dataTransfer.files : null);

    // Reset input file để tránh giữ trạng thái cũ
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  // Xử lý xóa ảnh đã tải lên (trong uploadedImageUrls)
  function handleRemoveUploadedImage(index) {
    const newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== index);
    setUploadedImageUrls(newUploadedUrls);
  }

  async function uploadImagesToCloudinary() {
    setImageLoadingState(true);
    const data = new FormData();

    // Thêm tất cả các file hình ảnh mới vào FormData
    for (const file of imageFiles) {
      data.append("my_files", file);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        data
      );

      if (response?.data?.success) {
        // Lấy URL của các ảnh đã tải lên
        const uploadedUrls = response.data.results.map((r) => r.url);

        // Cập nhật lại uploadedImageUrls với các URL mới
        setUploadedImageUrls(uploadedUrls); // Thay thế ảnh cũ bằng ảnh mới
        setImageFiles(null); // Reset imageFiles để tránh tái tải ảnh
        setImageLoadingState(false);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFiles && imageFiles.length > 0) {
      uploadImagesToCloudinary();
    }
  }, [imageFiles]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Label className="font-semibold my-4 block">Chọn hình ảnh sản phẩm</Label>

      {/* Khung chứa ảnh */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 `}
      >
        {/* Input file (ẩn) */}
        {/* Ở đây ta sẽ lấy được imageFiles */}
        <Input
          id="image-upload"
          multiple
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
        />

        {/* Nếu không có ảnh */}
        {!imageFiles && !uploadedImageUrls?.length ? (
          <Label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center h-32 cursor-pointer `}
          >
            <UploadCloudIcon className="w-10 h-10 mb-2" />
            <span>Kéo, thả hoặc click để tải ảnh</span>
          </Label>
        ) : null}

        {/* Hiển thị trạng thái loading */}
        {imageLoadingState && (
          <Skeleton className="h-24 bg-gray-300 text-gray-500 flex items-center justify-center">
            Đang tải ảnh lên cloud !
          </Skeleton>
        )}

        {/* Hiển thị ảnh đã tải lên hoặc ảnh mới */}
        <div className="my-2 grid grid-cols-3 gap-2">
          {uploadedImageUrls?.map((url, index) => (
            <div key={`uploaded-${index}`} className="relative">
              <img
                src={url}
                alt={`Uploaded Image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveUploadedImage(index)}
              >
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Remove File</span>
              </Button>
            </div>
          ))}

          {/* {imageFiles &&
            Array.from(imageFiles).map((file, index) => (
              <div key={`new-${index}`} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="New Image Thumbnail"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
                  onClick={() => handleRemoveImage(index)}
                >
                  <XIcon className="w-4 h-4" />
                  <span className="sr-only">Remove File</span>
                </Button>
              </div>
            ))} */}
        </div>
      </div>
    </div>
  );
}

export default ProductImageUpload;
