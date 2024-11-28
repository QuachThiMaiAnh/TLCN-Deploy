import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Sử dụng biểu tượng mũi tên nếu dùng Lucide

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
  setUploadedImageUrls,
  setImageFiles,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Xử lý khi nhấn nút "Trước"
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  // Xử lý khi nhấn nút "Tiếp"
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Hàm định dạng số với dấu chấm ngăn cách
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  return (
    <Card className="w-full max-w-sm mx-auto  hover:scale-105 hover:shadow-muted-foreground hover:shadow-xl duration-200 ">
      <div>
        <div className="relative">
          <img
            src={product?.images[currentImageIndex]}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          {/* Nút chuyển ảnh */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={handlePreviousImage}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
              >
                <ChevronRight />
              </button>
            </>
          )}
        </div>
        <CardContent>
          <h2 className="text-xl font-bold mb-2 mt-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0
                  ? "line-through text-lg font-semibold text-primary text-red-500"
                  : "text-lg font-bold"
              } `}
            >
              {product?.price != null
                ? `${formatNumberWithSeparator(product.price)}đ`
                : ""}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-bold">
                {product.salePrice != null
                  ? `${formatNumberWithSeparator(product.salePrice)}đ`
                  : ""}
              </span>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          {/* <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
          >
            Sửa
          </Button> */}
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true); // Mở dialog chỉnh sửa
              setCurrentEditedId(product?._id); // Gắn ID sản phẩm hiện tại để chỉnh sửa
              setFormData(product); // Gắn dữ liệu sản phẩm vào form
              setUploadedImageUrls(product?.images || []); // Hiển thị hình ảnh hiện tại
              setImageFiles(null); // Xóa trạng thái ảnh mới (nếu có)
            }}
          >
            Sửa
          </Button>

          <Button
            className=" hover:bg-destructive "
            onClick={() => handleDelete(product?._id)}
          >
            Xóa
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminProductTile;
