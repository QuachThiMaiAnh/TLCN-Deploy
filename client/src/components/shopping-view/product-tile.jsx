import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
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
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
              Sản phẩm đã hết hàng!
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
              {`Chỉ còn ${product?.totalStock} sản phẩm!`}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
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
          {/* giá SP */}
          {/* <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0
                  ? "line-through text-sm text-red-400"
                  : ""
              } text-lg font-semibold text-primary`}
            >
              {product?.price != null
                ? `${formatNumberWithSeparator(product.price)}đ`
                : ""}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-xl font-semibold text-primary">
                {product.salePrice != null
                  ? `${formatNumberWithSeparator(product.salePrice)}đ`
                  : ""}
              </span>
            ) : null}
          </div> */}

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
