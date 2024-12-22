import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "@/store/auth-slice";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordFormControls } from "@/config";
import CommonForm from "@/components/common/form";

const initialState = {
  email: "",
};

function ForgotPassword() {
  const [formData, setFormData] = useState(initialState);
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast({ title: "Vui lòng nhập email !", variant: "destructive" });
      return;
    }

    dispatch(forgotPassword(formData.email)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn !",
        });
      } else {
        toast({ title: error, variant: "destructive" });
      }
    });
  };
  return (
    <div className="bg-[url('https://res.cloudinary.com/duxdsq6hd/image/upload/v1734861620/y7s12hoptbsdtfrfbief.jpg')] bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center  ">
      <div className="mx-auto w-full max-w-md space-y-6 p-10 bg-white bg-opacity-90 rounded-lg shadow-black shadow-lg">
        <h1 className="text-3xl font-bold text-center">Quên Mật Khẩu</h1>
        <CommonForm
          formControls={forgotPasswordFormControls}
          buttonText={"Gửi yêu cầu khôi phục mật khẩu"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default ForgotPassword;
