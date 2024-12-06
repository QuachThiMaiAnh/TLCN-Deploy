import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Eye, EyeOff } from "lucide-react";

function CommonForm({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  externalValidation = () => true, // Nhận thêm hàm validate từ bên ngoài
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(""); // Lưu lỗi cho password
  const [emailError, setEmailError] = useState(""); // Lưu lỗi cho email
  const [displayValues, setDisplayValues] = useState({}); // Lưu giá trị hiển thị cho input số
  const [isBtnDisabled, setIsBtnDisabled] = useState(true); // Thêm trạng thái cho nút submit

  useEffect(() => {
    setIsBtnDisabled(!validateForm() || !externalValidation()); // Kết hợp validate nội bộ và ngoại vi
  }, [formData, passwordError, emailError, externalValidation]); // Theo dõi thay đổi validate bên ngoài

  const types = {
    INPUT: "input",
  };

  function validateForm() {
    let isValid = true;

    // Validate password
    if (formData.password && !validatePassword(formData.password)) {
      isValid = false;
    }

    // Validate email
    if (formData.email && !validateEmail(formData.email)) {
      isValid = false;
    }

    // Check all fields, except for optional fields
    for (const control of formControls) {
      const value = formData[control.name];

      // Skip validation for optional fields
      if (control.required === false) {
        continue; // Skip if the field is optional
      }

      // Check for required fields
      if (value === null || value === undefined || value === "") {
        isValid = false;
        break; // Exit loop if a required field is empty
      }
    }

    return isValid;
  }

  function handleEmailChange(event) {
    const { value } = event.target;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
    validateEmail(value);
  }

  // Hàm định dạng số với dấu chấm ngăn cách
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleNumberChange(event, name) {
    let inputValue = event.target.value.replace(/\./g, ""); // Xóa dấu chấm khỏi giá trị nhập
    let displayValue = formatNumberWithSeparator(inputValue); // Thêm dấu chấm ngăn cách

    setDisplayValues({
      ...displayValues,
      [name]: displayValue, // Cập nhật giá trị hiển thị cho input số
    });

    setFormData({
      ...formData,
      // [name]: Number(inputValue), // Lưu giá trị không có dấu chấm vào formData
      [name]: !isNaN(inputValue) ? Number(inputValue) : "", // Nếu rỗng thì gán giá trị "" để tránh NaN
    });
  }

  function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) {
      setPasswordError(`Mật khẩu phải dài ít nhất ${minLength} ký tự.`);
      return false;
    }
    if (!hasUpperCase) {
      setPasswordError("Mật khẩu phải chứa ít nhất một chữ cái viết hoa.");
      return false;
    }
    if (!hasLowerCase) {
      setPasswordError("Mật khẩu phải chứa ít nhất một chữ cái thường.");
      return false;
    }
    if (!hasNumbers) {
      setPasswordError("Mật khẩu phải chứa ít nhất một chữ số.");
      return false;
    }
    if (!hasSpecialChar) {
      setPasswordError("Mật khẩu phải chứa ít nhất một ký tự đặc biệt.");
      return false;
    }

    setPasswordError(""); // Xóa lỗi nếu hợp lệ
    return true;
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Vui lòng nhập địa chỉ email hợp lệ.");
      return false;
    }

    setEmailError(""); // Xóa lỗi nếu hợp lệ
    return true;
  }

  function handlePasswordChange(event) {
    const { value } = event.target;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
    validatePassword(value);
  }

  function handleEmailChange(event) {
    const { value } = event.target;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
    validateEmail(value);
  }
  useEffect(() => {
    // Định dạng lại các giá trị số khi dữ liệu từ database được load lên
    const formattedDisplayValues = {};
    for (const control of formControls) {
      if (control.type === "number" && formData[control.name] != null) {
        formattedDisplayValues[control.name] = formatNumberWithSeparator(
          formData[control.name]
        );
      }
    }
    setDisplayValues(formattedDisplayValues);
  }, [formData, formControls]);

  // Hàm định dạng số với dấu chấm ngăn cách (giữ nguyên)
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name] || "";
    const displayValue = displayValues[getControlItem.name] || value;

    switch (getControlItem.componentType) {
      case types.INPUT:
        if (getControlItem.type === "password") {
          element = (
            <div className="relative">
              <Input
                name={getControlItem.name}
                placeholder={getControlItem.placeholder}
                id={getControlItem.name}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>
          );
        } else if (getControlItem.type === "email") {
          element = (
            <div>
              <Input
                name={getControlItem.name}
                placeholder={getControlItem.placeholder}
                id={getControlItem.name}
                type="email"
                value={value}
                onChange={handleEmailChange}
              />
              {emailError && (
                <p className="text-red-500 text-sm">{emailError}</p>
              )}
            </div>
          );
        } else if (getControlItem.type === "number") {
          element = (
            <Input
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              id={getControlItem.name}
              type="text"
              value={displayValue} // Hiển thị giá trị có dấu chấm ngăn cách
              onChange={(event) =>
                handleNumberChange(event, getControlItem.name)
              }
              // inputMode="numeric" // Hỗ trợ bàn phím số trên thiết bị di động
              // pattern="[0-9]*" // Đảm bảo chỉ cho phép các ký tự số
            />
          );
        } else {
          element = (
            <div>
              <Input
                name={getControlItem.name}
                placeholder={getControlItem.placeholder}
                id={getControlItem.name}
                type={getControlItem.type}
                value={value}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    [getControlItem.name]: event.target.value,
                  })
                }
              />
              {/* {textError && <p className="text-red-500 text-sm">{textError}</p>} */}
            </div>
          );
        }
        break;

      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [getControlItem.name]: value,
              })
            }
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options?.map((optionItem) => (
                <SelectItem key={optionItem.id} value={optionItem.id}>
                  {optionItem.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;

      case "textarea":
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.id}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;

      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;
    }

    return element;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label className="mb-1 font-bold">{controlItem.label}</Label>
            {renderInputsByComponentType(controlItem)}
          </div>
        ))}
      </div>

      <Button disabled={isBtnDisabled} type="submit" className="mt-2 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;
