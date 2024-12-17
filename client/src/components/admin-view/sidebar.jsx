import {
  BadgeCheck,
  ChartBar,
  Layers3,
  LayoutDashboard,
  PawPrint,
  ShoppingBasket,
  SquareStack,
  Users,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Bảng điều khiển",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    id: "features",
    label: "Banner",
    path: "/admin/features",
    icon: <Layers3 />,
  },
  {
    id: "products",
    label: "Sản phẩm",
    path: "/admin/products",
    icon: <ShoppingBasket />,
  },
  {
    id: "orders",
    label: "Đơn hàng",
    path: "/admin/orders",
    icon: <BadgeCheck />,
  },
  {
    id: "users",
    label: "Khách hàng",
    path: "/admin/users",
    icon: <Users />,
  },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {/* điều hướng đến trang tương ứng của menuItem trong SideBar */}
      {/* sau khi click để điều hướng trang (đối với trường hợp hiển thị trên điện thoại có truyền prop setOpen)
       thì cần tắt sidebar đi bằng cách setOpen(false) */}
      {adminSidebarMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => {
            navigate(menuItem.path);
            setOpen ? setOpen(false) : null;
          }}
          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-muted-foreground border font-bold hover:bg-muted hover:text-foreground hover:border-black "
        >
          {menuItem.icon}
          <span>{menuItem.label}</span>
        </div>
      ))}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
    // <Fragment></Fragment> hoặc ngắn gọn là <>...</>
    // được sử dụng để bọc các thành phần mà không tạo thêm một thẻ DOM bao quanh nào.
    <Fragment>
      {/* 
    Khi open là true, sidebar (ở dạng Sheet – một panel trượt vào) sẽ hiện ra.
    Sheet được dùng để tạo sidebar dạng overlay (hiện đè) trên màn hình nhỏ. 
    Over được tạo tự động
    Prop onOpenChange của Sheet dùng setOpen để thay đổi trạng thái của sidebar khi người dùng mở hoặc đóng. */}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-60">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5">
                <ChartBar size={30} />
                <p className="text-xl font-extrabold text-gradient">
                  Quản trị viên{" "}
                </p>
              </SheetTitle>
            </SheetHeader>
            {/* trường hợp hiển thị trên điện thoại => truyền prop setOpen để đóng/mở sideBar */}
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden w-60 flex-col border-r bg-background p-6 lg:flex">
        {/* điều hướng trở lại trang của quản trị viên */}
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-2"
        >
          <ChartBar size={30} />
          <p className="text-xl font-extrabold ">Quản trị viên</p>
        </div>
        {/* Trường hợp màn hình large => Ko có truyền prop setOpen */}
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
