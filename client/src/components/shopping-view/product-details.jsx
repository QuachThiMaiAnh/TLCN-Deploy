import { StarIcon, StarsIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useState, useRef, useEffect } from "react";
import { addReview, getReviews, clearError } from "@/store/shop/review-slice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../ui/badge";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews, error } = useSelector((state) => state.shopReview);

  const { toast } = useToast();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const [selectedColor, setSelectedColor] = useState(null); // Màu được chọn

  useEffect(() => {
    if (productDetails?.colors?.length > 0) {
      setSelectedColor(productDetails.colors[0]); // Chọn màu đầu tiên
    }
  }, [productDetails]);

  const handleColorSelect = (color) => {
    setSelectedColor(color); // Cập nhật màu được chọn
  };

  const [selectedSize, setSelectedSize] = useState(null); // Kích thước được chọn

  const handleSizeSelect = (size) => {
    if (selectedSize?._id === size._id) {
      setSelectedSize(null); // Bỏ chọn nếu đã chọn
    } else {
      setSelectedSize(size); // Chọn kích thước
    }
  };

  function handleAddToCart(productId, colorId, sizeId, quantity) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId,
        colorId,
        sizeId,
        quantity,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Đã thêm sản phẩm vào giỏ hàng!",
        });
      }
    });
  }

  // Toggle mở rộng/thu gọn mô tả
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Hàm định dạng số với dấu chấm ngăn cách
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Xử lý di chuyển giữa các ảnh
  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      setCurrentImageIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : productDetails.images.length - 1
      );
    } else if (event.key === "ArrowRight") {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < productDetails.images.length - 1 ? prevIndex + 1 : 0
      );
    }
  };

  // Xử lý khi nhấn vào thumbnail
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  function handleRatingChange(getRating) {
    // console.log(getRating, "getRating");

    setRating(getRating);
  }

  function handleDialogClose() {
    /**
     * khi mở CTSP -> qua trang khác rồi quay lại trang SP, dialog này tự mở lên
     * làm điều này để ngăn chặn điều đó xảy ra
     */
    setOpen(false);
    // state.productDetails = null;
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Đánh giá được thêm thành công !",
        });
      }
    });
    setRating(0);
    setReviewMsg("");
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  useEffect(() => {
    if (error) {
      // Hiển thị lỗi trong một khoảng thời gian ngắn, sau đó xóa lỗi
      const timer = setTimeout(() => {
        dispatch(clearError()); // Reset lỗi về rỗng
      }, 5000); // Xóa lỗi sau 3 giây

      return () => clearTimeout(timer); // Dọn dẹp bộ đếm thời gian khi component unmount
    }
  }, [error, dispatch]);

  // console.log(reviews, "reviews");

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogClose}
      onKeyDown={handleKeyDown}
    >
      <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw] h-full overflow-auto">
        {/* Ảnh chính */}
        <div className="relative rounded-lg ">
          <img
            src={productDetails?.images?.[currentImageIndex]}
            alt={productDetails?.title}
            className="w-full h-96 object-cover rounded-lg mx-auto border-2 border-blue-200 shadow-xl"
          />

          {/* Nút chuyển ảnh trái/phải */}
          {productDetails?.images.length > 1 && (
            <button
              onClick={() =>
                setCurrentImageIndex((prevIndex) =>
                  prevIndex > 0
                    ? prevIndex - 1
                    : productDetails.images.length - 1
                )
              }
              className="absolute top-1/4 left-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow shadow-inner shadow-slate-500"
            >
              <ChevronLeft />
            </button>
          )}
          {productDetails?.images.length > 1 && (
            <button
              onClick={() =>
                setCurrentImageIndex((prevIndex) =>
                  prevIndex < productDetails.images.length - 1
                    ? prevIndex + 1
                    : 0
                )
              }
              className="absolute top-1/4 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-inner shadow-slate-500"
            >
              <ChevronRight />
            </button>
          )}

          {/* Thumbnail images */}
          {productDetails?.images.length > 1 && (
            <div
              className="flex mt-4 space-x-2 overflow-x-auto justify-center"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  setCurrentImageIndex((prevIndex) =>
                    prevIndex > 0
                      ? prevIndex - 1
                      : productDetails.images.length - 1
                  );
                } else if (e.key === "ArrowRight") {
                  setCurrentImageIndex((prevIndex) =>
                    prevIndex < productDetails.images.length - 1
                      ? prevIndex + 1
                      : 0
                  );
                }
              }}
            >
              {productDetails?.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${productDetails.title} thumbnail ${index + 1}`}
                  onClick={() => handleThumbnailClick(index)}
                  tabIndex={-1} // Loại bỏ khả năng focus
                  className={`w-20 h-20 object-cover rounded cursor-pointer outline-none ${
                    index === currentImageIndex
                      ? "border border-gray-800"
                      : "border border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Phần nội dung chính */}
        <div className="">
          <div>
            <h1 className="text-xl text-gradient">{productDetails?.title}</h1>
            <div className="font-semibold mb-4 mt-4">
              Kho còn{" "}
              <span className="font-bold ">{productDetails?.totalStock}</span>{" "}
              sản phẩm !
            </div>

            {/* Danh sách màu sắc và kích thước */}
            <div className="flex flex-col gap-4 border-dashed border-[2px] p-4 rounded-md mb-4">
              {/* Danh sách màu sắc */}
              <div className="">
                <h2 className="font-semibold mb-4">Chọn màu sắc</h2>
                <div className="flex flex-wrap gap-4">
                  {productDetails?.colors?.map(
                    (color) =>
                      color.sizes.some((size) => size.quantity > 0) && (
                        <div
                          key={color._id}
                          className={`cursor-pointer border ${
                            selectedColor?._id === color._id
                              ? "border-blue-500"
                              : "border-gray-300"
                          } rounded-lg p-2`}
                          onClick={() => handleColorSelect(color)}
                        >
                          <img
                            src={color.image}
                            alt={color.name}
                            className="w-16 h-16 object-cover rounded-lg mb-2"
                          />
                          <p className="text-center text-sm">{color.name}</p>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* Danh sách kích thước */}
              <div>
                <h2 className="font-semibold mb-4">
                  Kích thước ({selectedColor?.name || "Chọn màu"})
                </h2>
                <div className="flex flex-wrap gap-4">
                  {selectedColor?.sizes
                    ?.filter((size) => size.quantity > 0)
                    ?.map((size) => (
                      <Badge
                        key={size._id}
                        onClick={() => handleSizeSelect(size)}
                        className={`cursor-pointer rounded-lg p-2 shadow-inner shadow-black text-black hover:bg-blue-100 flex flex-col
            ${selectedSize?._id === size._id ? "bg-blue-100" : "bg-white"}`}
                      >
                        <p className="font-extrabold">{size.size}</p>
                        <p className=""> (còn {size.quantity} SP)</p>
                      </Badge>
                    ))}
                  {selectedColor?.sizes?.every(
                    (size) => size.quantity === 0
                  ) && <p className="text-red-500">Màu này đã hết hàng!</p>}
                </div>
              </div>
            </div>

            <div
              className={`flex items-center mb-4 ${
                productDetails?.salePrice > 0
                  ? "justify-between"
                  : "justify-start"
              }`}
            >
              {productDetails?.salePrice > 0 ? (
                <>
                  <span className="line-through text-red-400 text-xl font-bold text-primary">
                    {productDetails?.price != null
                      ? `${formatNumberWithSeparator(productDetails.price)}đ`
                      : ""}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {productDetails.salePrice != null
                      ? `${formatNumberWithSeparator(
                          productDetails.salePrice
                        )}đ`
                      : ""}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-primary">
                  {productDetails?.price != null
                    ? `${formatNumberWithSeparator(productDetails.price)}đ`
                    : ""}
                </span>
              )}
            </div>

            <div className="flex justify-between gap-2 mb-4 font-bold">
              <span>Lượt bán: {productDetails?.sales}</span>
              <span className="text-pretty flex gap-2 items-center">
                Đánh giá: {averageReview.toFixed(2)} <StarsIcon />
              </span>
            </div>
            <div className="mb-10">
              {productDetails?.totalStock === 0 ? (
                <Button className="w-full opacity-60 cursor-not-allowed">
                  Sản phẩm đã hết hàng
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() =>
                    handleAddToCart(
                      productDetails?._id,
                      selectedColor?._id,
                      selectedSize?._id,
                      1
                    )
                  }
                  disabled={!selectedColor || !selectedSize}
                >
                  Thêm vào giỏ hàng
                </Button>
              )}
            </div>

            <p className="font-bold mb-4">Mô tả sản phẩm : </p>
            <div className="pl-4">
              <p
                className={`text-muted-foreground text-md mb-1  overflow-hidden ${
                  isExpanded ? "max-h-[300px] overflow-y-auto" : "line-clamp-3"
                }`}
              >
                {productDetails?.description?.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              {/* Kiểm tra chiều dài mô tả */}
              {productDetails?.description?.split("\n").length > 3 && (
                <button
                  onClick={toggleExpanded}
                  className="text-blue-400 text-sm hover:underline mb-5 hover:underline-offset-2"
                >
                  {isExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Phần đánh giá sản phẩm */}
          <div className="max-h-[700px] overflow-auto mb-4">
            <p className="font-bold mb-4">Đánh giá sản phẩm </p>
            <div className="grid gap-4 ">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem) => (
                  <div className="flex gap-4 items-center rounded-xl bg-slate-200">
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback className="bg-gray-400 font-bold">
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{reviewItem?.userName}</h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">
                  Hiện tại chưa có đánh giá nào!!
                </p>
              )}
            </div>
            <div className="mt-10 p-2 flex-col flex gap-4 p-4 border-[1px] rounded-md ">
              <Label className="text-md">Thêm đánh giá sản phẩm</Label>
              {/* Hiển thị điểm sao */}
              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="Viết đánh giá sản phẩm ..."
              />
              {/* Hiển thị lỗi */}
              {error && <p className="font-bold text-red-500">{error}</p>}{" "}
              <Button
                onClick={handleAddReview}
                disabled={reviewMsg.trim() === ""}
              >
                Gửi
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
