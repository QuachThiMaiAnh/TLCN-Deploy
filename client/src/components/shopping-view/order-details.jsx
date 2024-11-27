import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import StarRatingComponent from "../common/star-rating";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "../ui/input";
import { addReview, getReviews, clearError } from "@/store/shop/review-slice";
import { useNavigate } from "react-router-dom";
import ProductDetailsDialog from "./product-details";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";

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
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { reviews, error } = useSelector((state) => state.shopReview);

  function handleRatingChange(getRating) {
    console.log(getRating, "getRating");
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
        // Đóng dialog sau khi gửi
        setIsDialogOpen(false);
        setSelectedProduct(null);
        setRating(0);
        setReviewMsg("");
        dispatch(fetchProductDetails(selectedProduct?.productId));
        // Thêm thời gian chờ 1 giây trước khi mở lại dialog
        setTimeout(() => {
          setOpen(true);
        }, 2000); // 1000ms = 1 giây
      }
    });
    setRating(0);
    setReviewMsg("");
  }

  // Hàm định dạng số với dấu chấm ngăn cách
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const getStatusPaymentLabel = (id) => {
    const options = [
      { id: "pending", label: "Chờ xử lý" },
      { id: "paid", label: "Đã thanh toán" },
    ];
    const status = options.find((option) => option.id === id);
    return status ? status.label : "Không xác định"; // Trả về mặc định nếu không tìm thấy
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
    return status ? status.label : "Không xác định"; // Trả về mặc định nếu không tìm thấy
  };

  useEffect(() => {
    if (error) {
      // Hiển thị lỗi trong một khoảng thời gian ngắn, sau đó xóa lỗi
      const timer = setTimeout(() => {
        dispatch(clearError()); // Reset lỗi về rỗng
      }, 5000); // Xóa lỗi sau 3 giây

      return () => clearTimeout(timer); // Dọn dẹp bộ đếm thời gian khi component unmount
    }
  }, [error, dispatch]);

  console.log(orderDetails, "orderDetails");

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
            <p className="font-bold">Trạng thánh thanh toán</p>
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
            <table className="table-auto w-full border-collapse border border-blue-300">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border border-blue-300 px-4 py-2 text-left">
                    Tên sản phẩm
                  </th>
                  <th className="border border-blue-300 px-4 py-2 text-left">
                    Số lượng
                  </th>
                  <th className="border border-blue-300 px-4 py-2 text-left">
                    Giá
                  </th>
                  <th className="border border-blue-300 px-4 py-2 text-left">
                    Đánh giá sản phẩm
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderDetails?.cartItems &&
                orderDetails?.cartItems.length > 0 ? (
                  orderDetails?.cartItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {item.title}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {formatNumberWithSeparator(item.price)}đ
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {orderDetails.orderStatus === "delivered" && (
                          <Button
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsDialogOpen(true);
                            }}
                          >
                            Đánh giá
                          </Button>
                        )}

                        {/* xử lý nút đánh giá sản phẩm */}
                        {isDialogOpen && (
                          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
                            <div className="bg-white p-6 rounded-lg w-1/2 ">
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
                                  onChange={(event) =>
                                    setReviewMsg(event.target.value)
                                  }
                                  placeholder="Viết đánh giá sản phẩm ..."
                                />
                                {/* Hiển thị lỗi */}
                                {error && (
                                  <p className="font-bold text-red-500">
                                    {error}
                                  </p>
                                )}{" "}
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="border border-gray-300 px-4 py-2 text-center"
                    >
                      Giỏ hàng trống
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Truyền xuống component chi tiết */}
        <ProductDetailsDialog
          open={open}
          setOpen={setOpen}
          productDetails={productDetails}
        />

        <Separator />
        {/* thông tin vận chuyển  */}
        <div className="grid gap-4">
          <div className="grid gap-4">
            <div className="font-bold">Thông tin vận chuyển: </div>
            <div className="grid gap-4 ">
              <Label>
                <span className="font-bold ">Địa chỉ:</span>{" "}
                {orderDetails?.addressInfo?.address}
              </Label>
              <Label>
                <span className="font-bold ">Thành phố/ Tỉnh:</span>{" "}
                {orderDetails?.addressInfo?.city}
              </Label>
              <Label>
                <span className="font-bold ">Pincode: </span>
                {orderDetails?.addressInfo?.pincode}
              </Label>
              <Label>
                <span className="font-bold ">Số điện thoại:</span>{" "}
                {orderDetails?.addressInfo?.phone}
              </Label>
              {orderDetails?.addressInfo?.notes && (
                <Label>
                  <span className="font-bold">Ghi chú: </span>
                  {orderDetails.addressInfo.notes}
                </Label>
              )}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
