// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { capturePayment } from "@/store/shop/order-slice";
// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { useLocation } from "react-router-dom";
// import waitingIcon from "../../assets/Waiting.gif";

// function PaypalReturnPage() {
//   const dispatch = useDispatch();
//   const location = useLocation();
//   const params = new URLSearchParams(location.search);
//   const paymentId = params.get("paymentId");
//   const payerId = params.get("PayerID");

//   useEffect(() => {
//     if (paymentId && payerId) {
//       const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

//       dispatch(capturePayment({ paymentId, payerId, orderId })).then((data) => {
//         if (data?.payload?.success) {
//           sessionStorage.removeItem("currentOrderId");
//           window.location.href = "/shop/payment-success";
//         }
//       });
//     }
//   }, [paymentId, payerId, dispatch]);

//   return (
//     <Card className="text-center font- bold">
//       <CardHeader>
//         <CardTitle className="text-gradient">
//           Đang xử lý thanh toán... Vui lòng đợi!
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="m-auto border-[5px] w-[300px] h-[300px] flex items-center justify-center  shadow-black shadow-2xl">
//           {" "}
//           <img src={waitingIcon} alt="" />
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export default PaypalReturnPage;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import waitingIcon from "../../assets/Waiting.gif";

function PaypalReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải
  const [errorMessage, setErrorMessage] = useState(null); // Trạng thái lỗi

  useEffect(() => {
    const processPayment = async () => {
      const orderId = sessionStorage.getItem("currentOrderId"); // Lấy Order ID

      if (paymentId && payerId && orderId) {
        try {
          const response = await dispatch(
            capturePayment({ paymentId, payerId, orderId })
          ).unwrap(); // Gửi yêu cầu xác nhận thanh toán

          if (response.success) {
            sessionStorage.removeItem("currentOrderId");
            navigate("/shop/payment-success"); // Chuyển đến trang thành công
          } else {
            throw new Error(response.message || "Thanh toán không thành công.");
          }
        } catch (error) {
          setErrorMessage(
            error.message || "Đã xảy ra lỗi khi xác nhận thanh toán."
          );
          console.error("Lỗi khi xử lý thanh toán PayPal:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setErrorMessage("Thông tin thanh toán không hợp lệ.");
        setIsLoading(false);
      }
    };

    processPayment();
  }, [paymentId, payerId, dispatch, navigate]);

  return (
    <Card className="text-center font-bold">
      <CardHeader>
        <CardTitle className="text-gradient">
          {isLoading
            ? "Đang xử lý thanh toán... Vui lòng đợi!"
            : errorMessage
            ? "Có lỗi xảy ra!"
            : "Thanh toán hoàn tất"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="m-auto border-[5px] w-[300px] h-[300px] flex items-center justify-center shadow-black shadow-2xl">
            <img src={waitingIcon} alt="Đang xử lý thanh toán" />
          </div>
        ) : errorMessage ? (
          <div>
            <p className="text-red-500 mb-4">{errorMessage}</p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Quay lại cửa hàng
            </button>
          </div>
        ) : (
          <div>
            <p className="text-green-500">Thanh toán đã hoàn tất!</p>
            <button
              onClick={() => navigate("/shop/orders")}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Xem đơn hàng của bạn
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PaypalReturnPage;
