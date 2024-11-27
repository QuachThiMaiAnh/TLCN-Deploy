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
    console.log(getRating, "getRating");

    setRating(getRating);
  }

  // xử lý thêm SP vào giỏ hàng
  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Chỉ có thể thêm số lượng tối đa là ${getQuantity} cho mặt hàng này`,
            variant: "destructive",
          });

          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
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

  console.log(reviews, "reviews");

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
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
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
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
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
            <p className="font-semibold mb-4">Mô tả sản phẩm : </p>
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

          <div
            className={`flex items-center mb-4 ${
              productDetails?.salePrice > 0
                ? "justify-between"
                : "justify-start"
            }`}
          >
            {productDetails?.salePrice > 0 ? (
              <>
                <span className="line-through text-red-400 text-lg font-bold text-primary">
                  {productDetails?.price != null
                    ? `${formatNumberWithSeparator(productDetails.price)}đ`
                    : ""}
                </span>
                <span className="text-lg font-bold text-primary">
                  {productDetails.salePrice != null
                    ? `${formatNumberWithSeparator(productDetails.salePrice)}đ`
                    : ""}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                {productDetails?.price != null
                  ? `${formatNumberWithSeparator(productDetails.price)}đ`
                  : ""}
              </span>
            )}
          </div>

          <div className="flex justify-between gap-2 mb-4">
            <span>Lượt bán: {productDetails?.sales}</span>
            <span className="text-pretty flex gap-2 items-center">
              Đánh giá: {averageReview.toFixed(2)} <StarsIcon />
            </span>
          </div>
          <div className="mb-4">
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
                    productDetails?.totalStock
                  )
                }
              >
                Thêm vào giỏ hàng
              </Button>
            )}
          </div>
          {/* <Separator /> */}

          <div className="max-h-[300px] overflow-auto mb-4">
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
                <h1>Chưa có đánh giá nào</h1>
              )}
            </div>
            <div className="mt-10 p-2 flex-col flex gap-4">
              <Label className="font-bold text-md">
                Thêm đánh giá sản phẩm
              </Label>
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
