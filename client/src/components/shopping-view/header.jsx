import { House, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import homeIcon from "../../assets/icons/Home.png";

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => {
        // Kiểm tra trạng thái active
        const isActive =
          location.pathname === menuItem.path &&
          (menuItem.id === "products"
            ? !searchParams.has("category") // "Sản phẩm" active nếu không có category
            : searchParams.get("category") === menuItem.id); // Kiểm tra category cho danh mục con

        return (
          <Label
            onClick={() => handleNavigate(menuItem)}
            className={`text-md font-bold cursor-pointer ${
              isActive
                ? "text-primary border-b-2 border-primary"
                : "text-gray-700"
            } hover:text-primary hover:border-b-2 hover:border-primary`}
            key={menuItem.id}
          >
            {menuItem.label}
          </Label>
        );
      })}
    </nav>
  );
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
    navigate("/auth/login");
  }

  useEffect(() => {
    if (cartItems?.userId) {
      dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch]);

  console.log(cartItems, "cartItems");

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      {/* xử lý giỏ hàng */}
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className="relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {/* số sản phẩm trong giỏ hàng */}
          <span className="absolute top-[-1px] right-[3px] text-xs">
            {cartItems?.length || 0}
          </span>
          <span className="sr-only">Giỏ hàng</span>
        </Button>

        {/* hiển thị các sản phẩm có trong giỏ hàng */}
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems && cartItems.length > 0 ? cartItems : []
          }
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-black">
            <AvatarFallback className="bg-black text-white font-extrabold">
              {user?.userName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
          <DropdownMenuLabel>
            Người đăng nhập là{" "}
            <p className="font-bold text-xl ">{user?.userName}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <UserCog className="mr-2 h-4 w-4" />
            Tài khoản
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-10 w-full border- bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* điều hướng về trang chủ */}
        <Link to="/shop/home" className="flex items-center gap-2">
          <img src={homeIcon} className="h-6 w-6 " alt="" />
          {/* <House className="h-6 w-6 " /> */}
          <span className="font-bold text-gradient mt-2">Bliss</span>
        </Link>
        <Sheet>
          {/* kích hoạt một "sheet" (cửa sổ phụ xuất hiện từ cạnh màn hình) */}
          {/* asChild cho phép SheetTrigger sử dụng phần tử con (Button) như là chính nó, 
          giúp phần tử con nhận các thuộc tính của SheetTrigger thay vì tạo thêm một phần tử wrapper (bao bọc). */}
          <SheetTrigger asChild>
            {/* variant="outline": Định kiểu nút bấm theo dạng viền (thường chỉ có viền xung quanh, không có nền). */}
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Chuyển đổi menu tiêu đề</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
            <HeaderRightContent />
          </SheetContent>
        </Sheet>
        {/* Màn hình máy tính */}
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
