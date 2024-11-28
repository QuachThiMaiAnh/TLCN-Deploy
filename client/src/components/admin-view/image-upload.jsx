// import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { useEffect, useRef } from "react";
// import { Button } from "../ui/button";
// import axios from "axios";
// import { Skeleton } from "../ui/skeleton";

// function ProductImageUpload({
//   imageFiles,
//   setImageFiles,
//   imageLoadingState,
//   uploadedImageUrls,
//   setUploadedImageUrls,
//   setImageLoadingState,
//   isEditMode,
//   isCustomStyling = false,
//   currentEditedId,
// }) {
//   /**
//    * useRef là một hook dùng để tạo một tham chiếu (reference) đến một phần tử DOM hoặc một giá trị nào đó
//    * trong component mà không gây re-render khi giá trị tham chiếu thay đổi.
//    * Tham chiếu này có thể được gắn  ô input, để thao tác với nó mà không làm component render lại.
//    *  truy cập trực tiếp phần tử input này qua inputRef.current
//    */
//   const inputRef = useRef(null);

//   // console.log(isEditMode, "isEditMode");

//   // xử lý thay đổi hình ảnh
//   function handleImageFileChange(event) {
//     const selectedFiles = event.target.files;
//     console.log(selectedFiles.length);
//     if (selectedFiles.length > 0) {
//       setImageFiles(selectedFiles); // Store FileList directly in state
//     }
//   }

//   function handleDragOver(event) {
//     event.preventDefault();
//   }

//   function handleDrop(event) {
//     event.preventDefault();
//     const droppedFiles = event.dataTransfer.files;
//     if (droppedFiles.length > 0) {
//       setImageFiles(droppedFiles);
//     }
//   }

//   /**
//    *  xóa một ảnh cụ thể trong danh sách các ảnh đã tải lên, bằng cách loại bỏ ảnh tại vị trí index khỏi danh sách imageFile.
//    */
//   function handleRemoveImage(index) {
//     const dataTransfer = new DataTransfer();
//     Array.from(imageFiles).forEach((file, i) => {
//       if (i !== index) {
//         dataTransfer.items.add(file);
//       }
//     });
//     setImageFiles(dataTransfer.files.length > 0 ? dataTransfer.files : null);
//     /**
//      * Đặt lại giá trị của inputRef (tức là input tải ảnh) về rỗng.
//      * Điều này đảm bảo khi người dùng muốn chọn lại file, input sẽ không lưu trạng thái trước đó.
//      */
//     if (inputRef.current) {
//       inputRef.current.value = "";
//     }
//   }
//   // async function uploadImageToCloudinary() {
//   //   // setImageLoadingState(true);
//   //   const data = new FormData();
//   //   data.append("my_file", imageFile);
//   //   // gọi API
//   //   const response = await axios.post(
//   //     "http://localhost:5000/api/admin/products/upload-image",
//   //     data
//   //   );
//   //   console.log(response, "response");

//   //   // if (response?.data?.success) {
//   //   //   setUploadedImageUrl(response.data.result.url);
//   //   //   setImageLoadingState(false);
//   //   // }
//   //   if (response) {
//   //     setUploadedImageUrl(response.data);
//   //   }
//   // }

//   // useEffect(() => {
//   //   if (imageFile !== null) uploadImageToCloudinary();
//   // }, [imageFile]);

//   async function uploadImagesToCloudinary() {
//     // Chỗ này hay lỗi!!
//     // ĐỢI ẢNH UPLOAD XONG MỚI CẬP NHẬT URL ĐỂ TRÁNH BỊ LỖI
//     setImageLoadingState(true);
//     const data = new FormData();
//     for (const file of imageFiles) {
//       data.append("my_files", file);
//     }

//     const response = await axios.post(
//       "http://localhost:5000/api/admin/products/upload-image",
//       data
//     );

//     if (response?.data?.success) {
//       const uploadedUrls = response.data.results.map((r) => r.url);
//       setUploadedImageUrls(uploadedUrls); // Update the state here
//       setImageLoadingState(false);
//     }
//   }

//   useEffect(() => {
//     console.log("Updated imageFiles:", imageFiles);
//   }, [imageFiles]);

//   useEffect(() => {
//     console.log("Updated uploadedImageUrls:", uploadedImageUrls);
//   }, [uploadedImageUrls]);

//   useEffect(() => {
//     if (imageFiles && imageFiles.length > 0) uploadImagesToCloudinary();
//   }, [imageFiles]);
//   return (
//     // Xử lý upload hình ảnh
//     <div
//       className="w-full max-w-md mx-auto"
//       // className={`w-full  mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}
//     >
//       <Label className=" font-semibold my-4 block">
//         Chọn hình ảnh sản phẩm
//       </Label>

//       {/* Tạo khung chứa ảnh */}
//       <div
//         onDragOver={handleDragOver}
//         onDrop={handleDrop}
//         className={`${
//           // isEditMode ? "" : ""
//           isEditMode ? "opacity-60" : ""
//         } border-2 border-dashed rounded-lg p-4`}
//       >
//         {/* ẩn input */}
//         <Input
//           id="image-upload"
//           multiple
//           type="file"
//           className="hidden"
//           ref={inputRef}
//           onChange={handleImageFileChange}
//           disabled={isEditMode}
//         />
//         {!imageFiles ? (
//           <Label
//             htmlFor="image-upload"
//             className={`${
//               // isEditMode ? "" : ""
//               isEditMode ? "cursor-not-allowed" : ""
//             } flex flex-col items-center justify-center h-32 cursor-pointer`}
//           >
//             <UploadCloudIcon className="w-10 h-10 mb-2" />
//             <span>Kéo, thả hoặc click để tải ảnh</span>
//           </Label>
//         ) : imageLoadingState ? (
//           // giữ chỗ ảnh
//           <Skeleton className="h-24 bg-gray-300" />
//         ) : (
//           <div className="my-2 grid grid-cols-3 gap-2">
//             {Array.from(imageFiles).map((file, index) => (
//               <div key={index} className="relative">
//                 <img
//                   src={URL.createObjectURL(file)}
//                   alt="Uploaded thumbnail"
//                   className="w-full h-24 object-cover rounded-lg"
//                 />
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
//                   onClick={() => handleRemoveImage(index)}
//                 >
//                   <XIcon className="w-4 h-4" />
//                   <span className="sr-only">Remove File</span>
//                 </Button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ProductImageUpload;

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
  isCustomStyling = false,
  currentEditedId,
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

  // Upload ảnh mới lên Cloudinary
  // async function uploadImagesToCloudinary() {
  //   setImageLoadingState(true);
  //   const data = new FormData();
  //   for (const file of imageFiles) {
  //     data.append("my_files", file);
  //   }

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/api/admin/products/upload-image",
  //       data
  //     );

  //     if (response?.data?.success) {
  //       const uploadedUrls = response.data.results.map((r) => r.url);
  //       setUploadedImageUrls([...uploadedImageUrls, ...uploadedUrls]); // Cập nhật URL ảnh mới
  //       setImageFiles(null); // Reset ảnh mới sau khi tải lên
  //       setImageLoadingState(false);
  //     }
  //   } catch (error) {
  //     console.error("Error uploading images:", error);
  //     setImageLoadingState(false);
  //   }
  // }

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
        className={`border-2 border-dashed rounded-lg p-4 ${
          isEditMode ? "opacity-60" : ""
        }`}
      >
        {/* Input file (ẩn) */}
        <Input
          id="image-upload"
          multiple
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode}
        />

        {/* Nếu không có ảnh */}
        {!imageFiles && !uploadedImageUrls?.length ? (
          <Label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center h-32 cursor-pointer ${
              isEditMode ? "cursor-not-allowed" : ""
            }`}
          >
            <UploadCloudIcon className="w-10 h-10 mb-2" />
            <span>Kéo, thả hoặc click để tải ảnh</span>
          </Label>
        ) : null}

        {/* Hiển thị trạng thái loading */}
        {imageLoadingState && <Skeleton className="h-24 bg-gray-300" />}

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

          {imageFiles &&
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
            ))}
        </div>
      </div>
    </div>
  );
}

export default ProductImageUpload;
