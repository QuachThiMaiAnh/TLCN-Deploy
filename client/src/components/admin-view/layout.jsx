import { Outlet } from "react-router-dom";
import AdminSideBar from "./sidebar";
import AdminHeader from "./header";
import { useState } from "react";

function AdminLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* admin sidebar */}
      <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col">
        {/* admin header */}
        <AdminHeader setOpen={setOpenSidebar} />
        {/* main content */}
        {/* Đặt nền với độ mờ 40 */}
        <main className="flex-1 flex-col flex bg-muted/40 p-4 md:p-6">
          {/* hiển thị các thành phần con tương ứng với các route khác nhau */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
