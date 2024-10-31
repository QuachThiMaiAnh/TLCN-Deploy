import { useState } from "react";
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
  isBtnDisabled,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(true); // State for password errors
  const [emailError, setEmailError] = useState(true); // State for email errors

  const types = {
    INPUT: "input",
  };

  // Password validation function with specific rules
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

    setPasswordError(""); // Clear any error if validation passes
    return true;
  }

  // Email validation function
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex pattern
    if (!emailRegex.test(email)) {
      setEmailError("Vui lòng nhập địa chỉ email hợp lệ.");
      return false;
    }

    setEmailError(""); // Clear any error if validation passes
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

  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name] || "";

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
                onChange={handlePasswordChange} // Handle password change
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
                onChange={handleEmailChange} // Handle email change
              />
              {emailError && (
                <p className="text-red-500 text-sm">{emailError}</p>
              )}
            </div>
          );
        } else {
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
            <Label className="mb-1">{controlItem.label}</Label>
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
