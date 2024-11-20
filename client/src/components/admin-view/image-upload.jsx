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
  uploadedImageUrls,
  setUploadedImageUrls,
  setImageLoadingState,
  isEditMode,
  // isCustomStyling = false,
}) {
  /**
   * useRef là một hook dùng để tạo một tham chiếu (reference) đến một phần tử DOM hoặc một giá trị nào đó
   * trong component mà không gây re-render khi giá trị tham chiếu thay đổi.
   * Tham chiếu này có thể được gắn  ô input, để thao tác với nó mà không làm component render lại.
   *  truy cập trực tiếp phần tử input này qua inputRef.current
   */
  const inputRef = useRef(null);

  // console.log(isEditMode, "isEditMode");

  // xử lý thay đổi hình ảnh
  function handleImageFileChange(event) {
    const selectedFiles = event.target.files;
    console.log(selectedFiles.length);
    if (selectedFiles.length > 0) {
      setImageFiles(selectedFiles); // Store FileList directly in state
    }
  }

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

  /**
   *  xóa một ảnh cụ thể trong danh sách các ảnh đã tải lên, bằng cách loại bỏ ảnh tại vị trí index khỏi danh sách imageFile.
   */
  function handleRemoveImage(index) {
    const dataTransfer = new DataTransfer();
    Array.from(imageFiles).forEach((file, i) => {
      if (i !== index) {
        dataTransfer.items.add(file);
      }
    });
    setImageFiles(dataTransfer.files.length > 0 ? dataTransfer.files : null);
    /**
     * Đặt lại giá trị của inputRef (tức là input tải ảnh) về rỗng.
     * Điều này đảm bảo khi người dùng muốn chọn lại file, input sẽ không lưu trạng thái trước đó.
     */
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }
  // async function uploadImageToCloudinary() {
  //   // setImageLoadingState(true);
  //   const data = new FormData();
  //   data.append("my_file", imageFile);
  //   // gọi API
  //   const response = await axios.post(
  //     "http://localhost:5000/api/admin/products/upload-image",
  //     data
  //   );
  //   console.log(response, "response");

  //   // if (response?.data?.success) {
  //   //   setUploadedImageUrl(response.data.result.url);
  //   //   setImageLoadingState(false);
  //   // }
  //   if (response) {
  //     setUploadedImageUrl(response.data);
  //   }
  // }

  // useEffect(() => {
  //   if (imageFile !== null) uploadImageToCloudinary();
  // }, [imageFile]);

  async function uploadImagesToCloudinary() {
    // Chỗ này hay lỗi!!
    // ĐỢI ẢNH UPLOAD XONG MỚI CẬP NHẬT URL ĐỂ TRÁNH BỊ LỖI
    setImageLoadingState(true);
    const data = new FormData();
    for (const file of imageFiles) {
      data.append("my_files", file);
    }

    const response = await axios.post(
      "http://localhost:5000/api/admin/products/upload-image",
      data
    );

    if (response?.data?.success) {
      const uploadedUrls = response.data.results.map((r) => r.url);
      setUploadedImageUrls(uploadedUrls); // Update the state here
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    console.log("Updated imageFiles:", imageFiles);
  }, [imageFiles]);

  useEffect(() => {
    console.log("Updated uploadedImageUrls:", uploadedImageUrls);
  }, [uploadedImageUrls]);

  useEffect(() => {
    if (imageFiles && imageFiles.length > 0) uploadImagesToCloudinary();
  }, [imageFiles]);
  return (
    // Xử lý upload hình ảnh
    <div
      className="w-full max-w-md mx-auto"
      // className={`w-full  mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}
    >
      <Label className=" font-semibold my-4 block">
        Chọn hình ảnh sản phẩm
      </Label>

      {/* Tạo khung chứa ảnh */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${
          // isEditMode ? "" : ""
          isEditMode ? "opacity-60" : ""
        } border-2 border-dashed rounded-lg p-4`}
      >
        {/* ẩn input */}
        <Input
          id="image-upload"
          multiple
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          // disabled={isEditMode}
        />
        {!imageFiles ? (
          <Label
            htmlFor="image-upload"
            className={`${
              // isEditMode ? "" : ""
              isEditMode ? "cursor-not-allowed" : ""
            } flex flex-col items-center justify-center h-32 cursor-pointer`}
          >
            <UploadCloudIcon className="w-10 h-10 mb-2" />
            <span>Kéo, thả hoặc click để tải ảnh</span>
          </Label>
        ) : imageLoadingState ? (
          // giữ chỗ ảnh
          <Skeleton className="h-24 bg-gray-300" />
        ) : (
          <div className="my-2 grid grid-cols-3 gap-2">
            {Array.from(imageFiles).map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Uploaded thumbnail"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
