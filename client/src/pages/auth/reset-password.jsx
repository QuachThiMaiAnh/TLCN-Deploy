import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "@/store/auth-slice";
import { useToast } from "@/hooks/use-toast";
import CommonForm from "@/components/common/form";
import { resetPasswordFormControls } from "@/config";

const initialState = {
  password: "",
  confirmPassword: "",
};

function ResetPassword() {
  const { token } = useParams();
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await dispatch(
      resetPassword({
        token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword,
      })
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
    <div className="bg-[url('https://res.cloudinary.com/duxdsq6hd/image/upload/v1734864511/gbjqrqb9hwsazfyrbcwz.jpg')] bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center  ">
      <div className="mx-auto w-full max-w-md space-y-6 p-10 bg-white bg-opacity-90 rounded-lg shadow-black shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Đặt Lại Mật Khẩu
        </h1>
        <CommonForm
          formControls={resetPasswordFormControls}
          buttonText={"Đặt lại mật khẩu"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default ResetPassword;
