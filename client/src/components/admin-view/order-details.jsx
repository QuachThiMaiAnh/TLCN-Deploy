import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "@/hooks/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails, pageSize, currentPage }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function formatNumberWithSeparator(value) {
    if (value == null) {
      return "0"; // Hoặc trả về một giá trị mặc định nếu cần
    }
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

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  return (
    <DialogContent className="sm:max-w-[700px] overflow-auto h-full">
      <div className="grid gap-6">
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
            <Label>
              {formatNumberWithSeparator(orderDetails?.totalAmount)}đ
            </Label>
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
                {getStatusLabel(orderDetails?.orderStatus)} -{" "}
                {new Date(orderDetails?.orderUpdateDate).toLocaleDateString(
                  "en-GB"
                )}
              </Badge>
            </Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="font-bold">Chi tiết đơn hàng:</div>
          <div className="grid gap-2 text-md">
            {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
              orderDetails.cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start border border-gray-300 p-4  rounded-md shadow-sm gap-4 "
                >
                  <img
                    src={item.images}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-sm"
                  />
                  <div className="flex flex-col gap-3">
                    <p className="font-bold">{item.title}</p>
                    <div className="grid grid-cols-4 gap-3">
                      <p>Màu sắc: {item.colorName}</p>
                      <p>Kích thước: {item.sizeName}</p>
                      <p>Số lượng: {item.quantity}</p>
                      <p>Giá: {formatNumberWithSeparator(item.price)}đ</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">Giỏ hàng trống</p>
            )}
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-4">
            <div className="font-bold">Thông tin vận chuyển: </div>
            <div className="grid gap-4">
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
                <span className="font-bold">Ghi chú: </span>
                {orderDetails?.addressInfo?.notes}
              </Label>
            </div>
          </div>
        </div>
        <Separator />
        <div>
          <p className="font-bold">Cập nhật trạng thái đơn hàng:</p>
          <CommonForm
            formControls={[
              {
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Chờ xử lý" },
                  { id: "confirmed", label: "Đã xác nhận" },
                  { id: "inShipping", label: "Đang vận chuyển" },
                  { id: "delivered", label: "Đã giao hàng" },
                  { id: "rejected", label: "Đã bị từ chối" },
                ],
                required: false,
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Cập nhật lại trạng thái đơn hàng !"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
