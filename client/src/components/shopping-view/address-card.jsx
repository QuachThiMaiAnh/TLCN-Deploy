import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Label } from "../ui/label";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  return (
    <Card
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      // Địa chỉ đc chọn thì...
      className={`cursor-pointer  ${
        selectedId?._id === addressInfo?._id
          ? "border-gray-900 border-[3px] shadow-md shadow-slate-600"
          : "border-black"
      }`}
    >
      <CardContent className="grid p-4 gap-4">
        <p
          className={`${
            selectedId?._id === addressInfo?._id
              ? "text-blue-400 font-bold text-center "
              : "hidden"
          }`}
        >
          ~ Bạn đã chọn địa chỉ giao hàng này ~
        </p>
        <Label>
          <span className="font-bold">Địa chỉ:</span> {addressInfo?.address}
        </Label>
        <Label>
          <span className="font-bold">Thành phố/ Tỉnh:</span>{" "}
          {addressInfo?.city}
        </Label>
        <Label>
          <span className="font-bold">Pincode: </span>
          {addressInfo?.pincode}
        </Label>
        <Label>
          <span className="font-bold">Số điện thoại:</span> {addressInfo?.phone}
        </Label>
        <Label>
          <span className="font-bold">Ghi chú: </span>
          {addressInfo?.notes}
        </Label>
      </CardContent>
      <CardFooter className="p-3 flex justify-between">
        <Button onClick={() => handleEditAddress(addressInfo)}>Sửa</Button>
        <Button
          className="hover:bg-red-500"
          onClick={() => handleDeleteAddress(addressInfo)}
        >
          Xóa
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;
