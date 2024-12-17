// hàm kiểm tra tất cả những thứ liên quan đến xác thực
import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  // nếu người dùng chưa được xác thực và cố truy cập vào trang nào đó không phải là login/ regiter
  if (
    !isAuthenticated &&
    !(
      location.pathname.includes("/login") ||
      location.pathname.includes("/register")
    )
  ) {
    return <Navigate to="/auth/login" />;
  }
  //   nếu người dùng đã đăng nhập thành công
  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    // kiểm tra quyền có người dùng để điều hướng đến trang tương ứng
    if (user?.role === "admin") {
      return <Navigate to={"/admin/dashboard"} />;
    } else {
      return <Navigate to={"/shop/home"} />;
    }
  }

  //   xử lý trường hợp người dùng không phải là admin truy cập vào trang của admin
  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.includes("admin")
  ) {
    return <Navigate to={"/unauth-page"} />;
  }

  //   xử lý trường hợp người dùng là admin try cập vào trang bán hàng
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.includes("shop")
  ) {
    return <Navigate to={"/admin/dashboard"} />;
  }
  return <>{children}</>;
}

export default CheckAuth;
