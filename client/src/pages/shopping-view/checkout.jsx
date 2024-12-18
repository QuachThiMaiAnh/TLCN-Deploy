import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import addressIcon from "../../assets/icons/Address.png";
import cartIcon from "../../assets/icons/Cart.png";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log(cartItems, "cartItems");

  // Tính tổng tiền đơn hàng
  const totalCartAmount =
    cartItems && cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  // Hàm định dạng số với dấu chấm ngăn cách
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleCodPayment() {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title:
          "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm để tiếp tục!",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Vui lòng chọn một địa chỉ để tiếp tục!",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        images: singleCartItem?.images, // Lấy ảnh theo màu sắc
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
        colorId: singleCartItem?.colorId, // Mã màu sắc
        sizeId: singleCartItem?.sizeId, // Mã kích thước
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "cod", // Thanh toán COD
      paymentStatus: "pending", // Trạng thái thanh toán ban đầu
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Đơn hàng COD đã được tạo thành công!",
          variant: "success",
        });

        setTimeout(() => {
          navigate("/shop/account"); // Chuyển hướng sau 2 giây
        }, 2000);
      } else {
        toast({
          title: "Có lỗi xảy ra. Vui lòng thử lại!",
          variant: "destructive",
        });
      }
    });
  }

  // hàm xử lý thanh toán Paypal
  function handleInitiatePaypalPayment() {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title:
          "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm để tiếp tục!",
        variant: "destructive",
      });
      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Vui lòng chọn một địa chỉ để tiếp tục!",
        variant: "destructive",
      });

      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        images: singleCartItem?.images,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
        colorId: singleCartItem?.colorId, // Mã màu sắc
        sizeId: singleCartItem?.sizeId, // Mã kích thước
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      console.log(data, "dataOrder");
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  if (approvalURL) {
    window.location.href = approvalURL;
    console.log(approvalURL, "approvalURL");
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-left-top" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        {/* Chọn địa chỉ */}
        <div>
          <p className="font-bold mb-6 text-2xl flex items-end gap-2">
            <img src={addressIcon} className="w-10 h-10" alt="" />
            <span>Địa chỉ giao hàng</span>
          </p>
          <Address
            selectedId={currentSelectedAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
        </div>
        {/* Hiển thị giỏ hàng */}
        <div>
          <p className="animate-marquee mb-5">
            <span className="animate-marquee-content text-2xl font-bold text-gradient">
              <img src={cartIcon} className="w-10 h-10" alt="Cart Icon" />
              <span>Giỏ hàng</span>
            </span>
          </p>

          <div className="flex flex-col gap-4">
            {cartItems && cartItems && cartItems.length > 0
              ? cartItems.map((item) => (
                  <UserCartItemsContent cartItem={item} />
                ))
              : null}

            {/* tính tổng tiền giỏ hàng */}
            <div className="mt-8 space-y-4">
              <div className="flex justify-between">
                <span className="font-bold">Tổng cộng</span>
                <span className="font-bold">
                  {`${formatNumberWithSeparator(totalCartAmount)}đ`}
                </span>
              </div>
            </div>

            <div className="mt-4 w-full">
              <Button onClick={handleInitiatePaypalPayment} className="w-full">
                {isPaymentStart
                  ? "Đang xử lý thanh toán Paypal.."
                  : "Thanh toán bằng Paypal"}
              </Button>
            </div>
            {/* <div className="mt-4 w-full">
              <Button className="w-full">
                {isPaymentStart
                  ? "Đang xử lý thanh toán MoMo..."
                  : "Thanh toán bằng MoMo"}
              </Button>
            </div> */}
            <div className="mt-4 w-full">
              <Button onClick={handleCodPayment} className="w-full">
                {isPaymentStart
                  ? "Đang xử lý thanh toán COD.."
                  : "Thanh toán bằng COD"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
