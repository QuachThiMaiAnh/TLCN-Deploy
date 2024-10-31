import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-white overflow-auto">
      {/* common header */}
      <ShoppingHeader />
      {/* main content */}
      <main className="flex flex-col w-full ">
        {/* hiển thị các thành phần con tương ứng với các route khác nhau */}
        <Outlet />
      </main>
    </div>
  );
}

export default ShoppingLayout;
