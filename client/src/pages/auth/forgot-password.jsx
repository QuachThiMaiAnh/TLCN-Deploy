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
  const { forgotPasswordError } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      toast({ title: "Vui lòng nhập email !", variant: "destructive" });
      return;
    }

    dispatch(forgotPassword(email)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn !",
        });
      } else {
        toast({ title: forgotPasswordError, variant: "destructive" });
      }
    });
  };
  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-10">
      <h1 className="text-3xl font-bold text-center">Quên Mật Khẩu</h1>
      {/* <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Gửi yêu cầu
        </Button>
      </form> */}

      <CommonForm
        formControls={forgotPasswordFormControls}
        buttonText={"Gửi yêu cầu khôi phục mật khẩu"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default ForgotPassword;
