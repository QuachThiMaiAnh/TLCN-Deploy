import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { clearCart } from "@/store/shop/cart-slice";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast"; // Thêm hook này nếu chưa có

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Đảm bảo khai báo trong component
  const { toast } = useToast(); // Hiển thị thông báo

  // Hàm định dạng số với dấu chấm ngăn cách
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Tính tổng tiền giỏ hàng
  const totalCartAmount =
    cartItems && cartItems.length > 0
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

  // Hàm xóa toàn bộ giỏ hàng
  function handleClearCart() {
    if (!user?.id) {
      toast({
        title: "Bạn cần đăng nhập để sử dụng tính năng này.",
        variant: "destructive",
      });
      return;
    }

    dispatch(clearCart(user.id)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Toàn bộ sản phẩm đã được xóa khỏi giỏ hàng.",
          variant: "success",
        });
      } else {
        toast({
          title: "Xóa giỏ hàng thất bại. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <SheetContent className="sm:max-w-lg h-full overflow-auto">
      <SheetHeader>
        <SheetTitle className="text-gradient">Giỏ hàng</SheetTitle>
      </SheetHeader>

      {/* Hiển thị các sản phẩm trong giỏ hàng */}
      <div className="mt-8 space-y-4">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => <UserCartItemsContent cartItem={item} />)
        ) : (
          <p className="text-center">Giỏ hàng của bạn đang trống.</p>
        )}
      </div>

      {/* Tính tổng tiền giỏ hàng */}
      <div className="mt-8 space-y-4">
        <div className="flex justify-between">
          <span className="font-bold">Tổng cộng</span>
          <span className="font-bold">
            {`${formatNumberWithSeparator(totalCartAmount)}đ`}
          </span>
        </div>
      </div>

      <div className="flex gap-4 mt-4 items-center">
        {/* Nút xóa toàn bộ giỏ hàng */}
        <Button
          onClick={handleClearCart}
          className="w-full mt-4 bg-red-400 hover:bg-red-600 text-white"
        >
          Xóa tất cả
        </Button>
        {/* Nút thanh toán */}
        <Button
          onClick={() => {
            navigate("/shop/checkout");
            setOpenCartSheet(false);
          }}
          className="w-full mt-5"
        >
          Thanh toán
        </Button>
      </div>
    </SheetContent>
  );
}

export default UserCartWrapper;
