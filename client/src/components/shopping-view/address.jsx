import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import AddressSelector from "./addressSelector";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [phoneError, setPhoneError] = useState("");
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "Bạn có thể thêm tối đa 3 địa chỉ!",
        variant: "destructive",
      });

      return;
    }

    // nếu có id địa chỉ thì chỉnh sửa nó
    currentEditedId !== null
      ? dispatch(
          editAddress({
            userId: user?.id,
            addressId: currentEditedId,
            formData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setCurrentEditedId(null);
            setFormData(initialAddressFormData);
            toast({
              title: "Địa chỉ đã được cập nhật thành công!",
            });
          }
        })
      : dispatch(
          // thêm địa chỉ mới
          addNewAddress({
            ...formData,
            userId: user?.id,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses(user?.id));
            setFormData(initialAddressFormData);
            toast({
              title: "Địa chỉ đã được thêm thành công!",
            });
          }
        });
  }

  function handleDeleteAddress(getCurrentAddress) {
    console.log(getCurrentAddress, "currentAddress");
    dispatch(
      deleteAddress({ userId: user?.id, addressId: getCurrentAddress._id })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({
          title: "Địa chỉ đã được xóa thành công!",
        });
      }
    });
  }

  function handleEditAddress(getCurrentAddress) {
    // Nhấn edit trên card address thì hàm này đc gọi
    console.log(getCurrentAddress, "curAdd");
    setCurrentEditedId(getCurrentAddress?._id);
    setFormData({
      ...formData,
      address: getCurrentAddress?.address,
      city: getCurrentAddress?.city,
      phone: getCurrentAddress?.phone,
      pincode: getCurrentAddress?.pincode,
      notes: getCurrentAddress?.notes,
    });
  }

  function isValidVietnamPhoneNumber(phone) {
    const vietnamPhoneRegex = /^(0)([1-9])[0-9]{8,9}$/;
    return vietnamPhoneRegex.test(phone.trim());
  }

  function isFormValid() {
    const isPhoneValid = isValidVietnamPhoneNumber(formData.phone);
    if (!isPhoneValid) {
      setPhoneError(
        "Số điện thoại chưa hợp lệ. Vui lòng nhập lại để tiếp tục !"
      ); // Set error message
    } else {
      setPhoneError(""); // Clear error message if valid
    }
    return isPhoneValid;
  }

  useEffect(() => {
    dispatch(fetchAllAddresses(user?.id));
  }, [dispatch]);

  // console.log(addressList, "addressList");

  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2  gap-2">
        {addressList && addressList.length > 0
          ? addressList.map((singleAddressItem) => (
              <AddressCard
                selectedId={selectedId}
                handleDeleteAddress={handleDeleteAddress}
                addressInfo={singleAddressItem}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))
          : null}
      </div>
      <CardHeader>
        <CardTitle className="text-gradient">
          {currentEditedId !== null ? "Sửa địa chỉ" : "Thêm địa chỉ"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {formData.phone && phoneError && (
          <Label>
            <Badge className="py-1 px-3 font-bold text-red-600 bg-white border-black shadow-inner shadow-black hover:bg-white">
              {phoneError}
            </Badge>
          </Label>
        )}

        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId !== null ? "Sửa" : "Thêm"}
          onSubmit={handleManageAddress}
          externalValidation={isFormValid} // Truyền điều kiện validate riêng
          // isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  );
}

export default Address;
