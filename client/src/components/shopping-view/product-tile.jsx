import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { clearError } from "@/store/shop/cart-slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const { cartItems, error } = useSelector((state) => state.shopCart);
  const dispatch = useDispatch();
  const { toast } = useToast();
  // Hàm định dạng số với dấu chấm ngăn cách
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Tính phần trăm giảm giá
  function calculateDiscountPercentage(originalPrice, salePrice) {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return null;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  const discountPercentage = calculateDiscountPercentage(
    product?.price,
    product?.salePrice
  );

  useEffect(() => {
    if (error) {
      toast({
        title: ` ${error} `,
        variant: "destructive",
      });
      // Hiển thị lỗi trong một khoảng thời gian ngắn, sau đó xóa lỗi
      const timer = setTimeout(() => {
        dispatch(clearError()); // Reset lỗi về rỗng
      }, 1000); // Xóa lỗi sau 3 giây

      return () => clearTimeout(timer); // Dọn dẹp bộ đếm thời gian khi component unmount
    }
  }, [error, dispatch]);

  return (
    <Card className="w-full max-w-sm mx-auto hover:border-gray-900 ">
      {/* quy định phần click vào để mở dialog product detail, phần để mở card
      => tránh xung đột */}
      <div onClick={() => handleGetProductDetails(product?._id)}>
        <div className="relative">
          {/* Ảnh sản phẩm */}
          <img
            src={product?.images[0]}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          {/* Thông báo về sản phẩm */}
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-gray-700 font-bold  border-black shadow-inner shadow-black hover:bg-red-500 text-white">
              Sản phẩm đã hết hàng!
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-white font-bold  shadow-inner shadow-black text-red-600 hover:bg-purple-200">
              {`Chỉ còn ${product?.totalStock} sản phẩm!`}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-white font-bold text-primary border-black shadow-inner shadow-black hover:bg-blue-300">
              Giảm {discountPercentage}%
            </Badge>
          ) : null}
        </div>

        {/* nội dung card sản phẩm */}
        <CardContent className="p-4">
          {/* tên sản phẩm */}
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          {/* loại sp - thương hiệu */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-muted-foreground">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-[16px] text-muted-foreground">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>

          <div
            className={`flex items-center mb-2 ${
              product?.salePrice > 0 ? "justify-between" : "justify-end"
            }`}
          >
            {product?.salePrice > 0 ? (
              <>
                <span className="line-through text-sm text-red-400 text-lg font-semibold text-primary">
                  {product?.price != null
                    ? `${formatNumberWithSeparator(product.price)}đ`
                    : ""}
                </span>
                <span className="text-xl font-semibold text-primary">
                  {product.salePrice != null
                    ? `${formatNumberWithSeparator(product.salePrice)}đ`
                    : ""}
                </span>
              </>
            ) : (
              <span className="text-lg font-semibold text-primary">
                {product?.price != null
                  ? `${formatNumberWithSeparator(product.price)}đ`
                  : ""}
              </span>
            )}
          </div>
        </CardContent>
      </div>
      {/* nút thêm SP vào giỏ hàng */}
      <CardFooter>
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed">
            Sản phẩm đã hết hàng
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full"
          >
            Thêm vào giỏ hàng
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
