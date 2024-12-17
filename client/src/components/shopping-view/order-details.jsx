import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import StarRatingComponent from "../common/star-rating";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "../ui/input";
import { addReview, getReviews, clearError } from "@/store/shop/review-slice";
import { useNavigate } from "react-router-dom";
import ProductDetailsDialog from "./product-details";
import { fetchProductDetails } from "@/store/shop/products-slice";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Trạng thái hiển thị dialog
  const [selectedProduct, setSelectedProduct] = useState(null); // Sản phẩm được chọn để đánh giá
  const { productDetails } = useSelector((state) => state.shopProducts);
  const { error } = useSelector((state) => state.shopReview);

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: selectedProduct?.productId,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(selectedProduct?.productId));
        toast({
          title: "Đánh giá được thêm thành công !",
        });
        setIsDialogOpen(false);
        setSelectedProduct(null);
        setRating(0);
        setReviewMsg("");
        dispatch(fetchProductDetails(selectedProduct?.productId));
        setTimeout(() => {
          setOpen(true);
        }, 2000); // 1000ms = 1 giây
      }
    });
  }

  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const getStatusPaymentLabel = (id) => {
    const options = [
      { id: "pending", label: "Chờ xử lý" },
      { id: "paid", label: "Đã thanh toán" },
    ];
    const status = options.find((option) => option.id === id);
    return status ? status.label : "Không xác định";
  };

  const getStatusLabel = (id) => {
    const options = [
      { id: "pending", label: "Chờ xử lý" },
      { id: "confirmed", label: "Đã xác nhận" },
      { id: "inShipping", label: "Đang vận chuyển" },
      { id: "delivered", label: "Đã giao hàng" },
      { id: "rejected", label: "Đã bị từ chối" },
    ];
    const status = options.find((option) => option.id === id);
    return status ? status.label : "Không xác định";
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <DialogContent className="sm:max-w-[700px] h-full overflow-auto">
      <div className="grid gap-6">
        {/* thông tin chung */}
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-bold">Id đơn hàng</p>
            <Label className="text-red-500">{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-bold">Ngày đặt hàng</p>
            <Label>
              {new Date(orderDetails?.orderDate).toLocaleDateString("en-GB")}
            </Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-bold">Tổng thanh toán</p>
            <Label>{orderDetails?.totalAmount}đ</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-bold">Phương thức thanh toán</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-bold">Trạng thái thanh toán</p>
            <Label>
              <Badge className="py-1 px-3 bg-white border-black shadow-inner shadow-black text-black hover:bg-white">
                {getStatusPaymentLabel(orderDetails?.paymentStatus)}
              </Badge>
            </Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-bold">Trạng thái đơn hàng</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.orderStatus === "pending"
                    ? "bg-blue-500"
                    : orderDetails?.orderStatus === "confirmed"
                    ? "bg-purple-700"
                    : orderDetails?.orderStatus === "inShipping"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {getStatusLabel(orderDetails?.orderStatus)}
              </Badge>
            </Label>
          </div>
        </div>
        <Separator />
        {/* chi tiết đơn hàng */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-bold mb-4">Chi tiết đơn hàng:</div>
            <div className="space-y-4">
              {orderDetails?.cartItems?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.images}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.colorName || "Không có màu"} ({" "}
                        {item.sizeName || "Không có kích thước"} )
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold">
                      {formatNumberWithSeparator(item.price)}đ
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedProduct(item);
                        setIsDialogOpen(true);
                      }}
                    >
                      Đánh giá
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Separator />
        {/* Chi tiết sản phẩm */}
        <ProductDetailsDialog
          open={open}
          setOpen={setOpen}
          productDetails={productDetails}
        />
        <Separator />
        {/* Thông tin vận chuyển */}
        <div className="grid gap-4">
          <div className="font-bold">Thông tin vận chuyển: </div>
          <div className="grid gap-4 ">
            <Label>
              <span className="font-bold">Địa chỉ:</span>{" "}
              {orderDetails?.addressInfo?.address}
            </Label>
            <Label>
              <span className="font-bold">Thành phố/ Tỉnh:</span>{" "}
              {orderDetails?.addressInfo?.city}
            </Label>
            <Label>
              <span className="font-bold">Pincode: </span>
              {orderDetails?.addressInfo?.pincode}
            </Label>
            <Label>
              <span className="font-bold">Số điện thoại:</span>{" "}
              {orderDetails?.addressInfo?.phone}
            </Label>
            <Label>
              <span className="font-bold">Ghi chú:</span>{" "}
              {orderDetails?.addressInfo?.notes}
            </Label>
          </div>
        </div>
      </div>

      {/* Modal đánh giá sản phẩm */}
      {isDialogOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="font-bold text-lg text-gradient mb-4">
              Đánh giá sản phẩm
            </h2>
            <div className="mt-6 p-2 flex-col items-center flex gap-2">
              <Label className="font-bold text-md">
                Sản phẩm: {selectedProduct.title}
              </Label>
              <div className="flex mt-2 gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Input
                className="mt-2 border-gray-500"
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="Viết đánh giá sản phẩm ..."
              />
              {error && <p className="font-bold text-red-500">{error}</p>}
              <div className="flex justify-between gap-4 mt-4">
                <Button
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === ""}
                >
                  Gửi đánh giá
                </Button>
                <Button
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedProduct(null);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
