import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  // imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  // setImageLoadingState,
  // isEditMode,
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
    console.log(event.target.files);
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setImageFile(selectedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
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

  return (
    <div
      className="w-full max-w-md mx-auto"
      // className={`w-full  mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}
    >
      <Label className="text-lg font-semibold mb-2 block">
        Tải hình ảnh lên
      </Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="
         border-2 border-dashed rounded-lg p-4"
      >
        {/* <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${
          isEditMode ? "opacity-60" : ""
        } border-2 border-dashed rounded-lg p-4`}
      > */}
        <Input
          id="image-upload"
          multiple
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          // disabled={isEditMode}
        />
        {!imageFile ? (
          // <Label
          //   htmlFor="image-upload"
          //   className={`${
          //     isEditMode ? "cursor-not-allowed" : ""
          //   } flex flex-col items-center justify-center h-32 cursor-pointer`}
          // >
          //   :imageLoadingState ? (
          //   <Skeleton className="h-10 bg-gray-100" />
          // )
          <Label
            htmlFor="image-upload"
            className="
            flex flex-col items-center justify-center h-32 cursor-pointer"
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Kéo, thả hoặc click để tải ảnh</span>
          </Label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon className="w-8 text-primary mr-2 h-8" />
            </div>
            <p className="text-sm font-medium">{imageFile.name}</p>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleRemoveImage}
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Remove File</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
