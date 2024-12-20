import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import waitingIcon from "../../assets/Waiting.gif";

function PaypalReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  useEffect(() => {
    if (paymentId && payerId) {
      const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

      dispatch(capturePayment({ paymentId, payerId, orderId })).then((data) => {
        if (data?.payload?.success) {
          sessionStorage.removeItem("currentOrderId");
          // window.location.href = "/shop/payment-success";
        }
      });
    }
  }, [paymentId, payerId, dispatch]);

  return (
    <Card className="text-center font- bold">
      <CardHeader>
        <CardTitle className="text-gradient">
          Đang xử lý thanh toán... Vui lòng đợi!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="m-auto border-[5px] w-[300px] h-[300px] flex items-center justify-center  shadow-black shadow-2xl">
          {" "}
          <img src={waitingIcon} alt="" />
        </div>
      </CardContent>
    </Card>
  );
}

export default PaypalReturnPage;
