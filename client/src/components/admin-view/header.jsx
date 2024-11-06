import { Logs, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b relative ">
      <Button onClick={() => setOpen(true)} className="lg:hidden sm:block">
        <Logs />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <p className="absolute left-1/2 -translate-x-1/2 text-2xl font-extrabold drop-shadow-lg hover:scale-110  transition-transform ">
        BLISS{" "}
      </p>
      {/* nằm phía cuối container */}
      <div className="flex flex-1 justify-end">
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow"
        >
          <LogOut />
          <span>Đăng xuất</span>
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
