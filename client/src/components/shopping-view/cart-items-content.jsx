import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCartItem,
  fetchCartItems,
  updateCartQuantity,
} from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Hàm định dạng số với dấu chấm ngăn cách
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // hàm xử lý thay đổi số lượng sản phẩm

  function handleUpdateQuantity(cartItem, typeOfAction) {
    if (typeOfAction === "plus" || typeOfAction === "minus") {
      // Lấy danh sách giỏ hàng hiện tại
      const getCartItems = cartItems || [];

      // Tìm sản phẩm trong giỏ hàng
      const indexOfCurrentCartItem = getCartItems.findIndex(
        (item) =>
          item.productId === cartItem?.productId &&
          item.colorId === cartItem?.colorId &&
          item.sizeId === cartItem?.sizeId
      );

      // Tìm thông tin sản phẩm trong danh sách sản phẩm
      const getCurrentProductIndex = productList.findIndex(
        (product) => product._id === cartItem?.productId
      );

      if (getCurrentProductIndex > -1) {
        const getTotalStock = productList[getCurrentProductIndex]?.totalStock;

        if (indexOfCurrentCartItem > -1) {
          const currentQuantity =
            getCartItems[indexOfCurrentCartItem]?.quantity;
          if (typeOfAction === "plus" && currentQuantity + 1 > getTotalStock) {
            toast({
              title: `Số lượng tối đa cho sản phẩm này là ${getTotalStock}`,
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Cập nhật số lượng và giữ nguyên các thông tin còn lại
      dispatch(
        updateCartQuantity({
          userId: user?.id,
          productId: cartItem?.productId,
          colorId: cartItem?.colorId,
          sizeId: cartItem?.sizeId,
          quantity:
            typeOfAction === "plus"
              ? cartItem?.quantity + 1
              : cartItem?.quantity - 1,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          // dispatch(fetchCartItems(user?.id)); // Bạn có thể cần gọi lại hàm này nếu muốn làm mới giỏ hàng
          toast({
            title:
              "Số lượng sản phẩm trong giỏ hàng đã được cập nhật thành công!",
          });
        }
      });
    }
  }

  // Hàm xóa sản phẩm khỏi giỏ hàng
  function handleCartItemDelete(cartItem) {
    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: cartItem?.productId,
        colorId: cartItem?.colorId,
        sizeId: cartItem?.sizeId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Sản phẩm đã được xóa khỏi giỏ hàng.",
        });
      }
    });
  }

  return (
    <div className="flex items-center space-x-6">
      <img
        src={cartItem?.images}
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>
        {/* Hiển thị thông tin màu sắc và kích thước */}
        <div className="text-sm text-gray-500 mt-2">
          <p>Màu sắc: {cartItem?.colorName || "Không xác định"}</p>
          <p>Kích thước: {cartItem?.sizeName || "Không xác định"}</p>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full hover:bg-gray-300"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Giảm</span>
          </Button>
          <span className="font-semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full hover:bg-gray-300"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Tăng</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          {`${formatNumberWithSeparator(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
              cartItem?.quantity
          )}đ`}
        </p>
        <div
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 mt-1 hover:bg-red-400 cursor-pointer"
          onClick={() => handleCartItemDelete(cartItem)}
        >
          <Trash size={18} />
        </div>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
