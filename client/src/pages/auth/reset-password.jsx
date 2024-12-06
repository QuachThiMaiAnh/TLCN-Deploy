import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "@/store/auth-slice";
import { useToast } from "@/hooks/use-toast";
// Giả sử bạn dùng Heroicons cho icon
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await dispatch(
      resetPassword({ token, newPassword, confirmPassword })
    );

    if (response?.payload?.success) {
      toast({ title: "Đặt lại mật khẩu thành công !" });
      navigate("/auth/login");
    } else {
      toast({
        title: error || "Có lỗi xảy ra",
        variant: "destructive",
      });
      if (error === "Liên kết đã hết hạn! Vui lòng yêu cầu một liên kết mới!") {
        navigate("/auth/login");
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 bg-white shadow-lg p-6 rounded-lg p-10">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Đặt Lại Mật Khẩu
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trường Mật khẩu mới */}
        <div className="relative">
          <Label
            htmlFor="new-password"
            className="block text-gray-600 font-bold mb-2"
          >
            Mật khẩu mới
          </Label>
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            className="absolute top-9 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setShowNewPassword((prev) => !prev)}
          >
            {showNewPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Trường Xác nhận mật khẩu */}
        <div className="relative">
          <Label
            htmlFor="confirm-password"
            className="block text-gray-600 font-bold mb-2"
          >
            Xác nhận mật khẩu
          </Label>
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            className="absolute top-9 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Nút Đặt lại mật khẩu */}
        <Button type="submit" className="w-full  text-white py-2 rounded-lg ">
          Đặt lại mật khẩu
        </Button>
      </form>
    </div>
  );
}

export default ResetPassword;
