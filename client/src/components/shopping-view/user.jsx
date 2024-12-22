import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo, changePassword } from "@/store/shop/user-slice"; // Redux actions cho cập nhật thông tin và đổi mật khẩu
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import CommonForm from "../common/form";
import { userFormControls } from "@/config"; // Đây là cấu hình form cho thông tin người dùng
import { PasswordFormControls } from "@/config"; // Đây là cấu hình form cho mật khẩu

const initialUserData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  // Thêm các trường cần thiết khác
};

const initialPasswordData = {
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

function UserProfile({ setCurrentSelectedAddress }) {
  const [userFormData, setUserFormData] = useState(initialUserData);
  const [passwordFormData, setPasswordFormData] = useState(initialPasswordData);
  const [passwordError, setPasswordError] = useState("");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  // Load thông tin người dùng từ Redux
  useEffect(() => {
    if (user) {
      setUserFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      });
    }
  }, [user]);

  // Hàm xử lý khi người dùng thay đổi thông tin
  function handleUpdateUser(event) {
    event.preventDefault();
    dispatch(updateUserInfo({ userId: user.id, formData: userFormData })).then(
      (data) => {
        if (data?.payload?.success) {
          toast({
            title: "Thông tin đã được cập nhật thành công!",
          });
        }
      }
    );
  }

  // Hàm xử lý đổi mật khẩu
  function handleChangePassword(event) {
    event.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    dispatch(changePassword(passwordFormData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Mật khẩu đã được đổi thành công!",
        });
        setPasswordFormData(initialPasswordData); // Clear password form
      }
    });
  }

  // Kiểm tra tính hợp lệ của mật khẩu
  function isPasswordFormValid() {
    const isPasswordValid =
      passwordFormData.newPassword &&
      passwordFormData.newPassword === passwordFormData.confirmNewPassword;
    if (!isPasswordValid) {
      setPasswordError("Mật khẩu mới không hợp lệ hoặc không khớp!");
    } else {
      setPasswordError("");
    }
    return isPasswordValid;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gradient">Thông tin cá nhân</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CommonForm
          formControls={userFormControls}
          formData={userFormData}
          setFormData={setUserFormData}
          buttonText="Cập nhật thông tin"
          onSubmit={handleUpdateUser}
        />
      </CardContent>

      <CardHeader>
        <CardTitle className="text-gradient">Đổi mật khẩu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {passwordError && (
          <Label>
            <Badge className="py-1 px-3 font-bold text-red-600 bg-white border-black shadow-inner shadow-black hover:bg-white">
              {passwordError}
            </Badge>
          </Label>
        )}

        <CommonForm
          formControls={PasswordFormControls}
          formData={passwordFormData}
          setFormData={setPasswordFormData}
          buttonText="Đổi mật khẩu"
          onSubmit={handleChangePassword}
          externalValidation={isPasswordFormValid}
        />
      </CardContent>
    </Card>
  );
}

export default UserProfile;
