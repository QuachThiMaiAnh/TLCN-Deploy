import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { loginFormControls } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { loginUser } from "@/store/auth-slice";
import { data } from "autoprefixer";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate(); // Hook navigate

  // Hàm điều hướng đến trang quên mật khẩu
  const handleForgotPassword = () => {
    navigate("/auth/forgot-password");
  };

  function onSubmit(event) {
    event.preventDefault();

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        console.log(data);
        toast({
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          ĐĂNG NHẬP
        </h1>
        <p className="mt-2">
          Chưa có tài khoản
          <Link
            className="font-bold ml-2 text-primary hover:underline underline-offset-2"
            to="/auth/register"
          >
            | Đăng ký
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={loginFormControls}
        buttonText={"Đăng nhập"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      {/* Nút điều hướng đến trang quên mật khẩu */}
      <div className="flex font-bold items-center justify-center gap-4 p-4 border-[1px] border-gray-300 rounded-md mt-2">
        <p>Bạn quên mật khẩu?</p>
        <Button variant="outline" onClick={handleForgotPassword}>
          Quên mật khẩu
        </Button>
      </div>
    </div>
  );
}

export default AuthLogin;
