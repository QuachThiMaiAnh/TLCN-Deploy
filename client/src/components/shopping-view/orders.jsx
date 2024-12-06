import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  console.log(orderList, "orderList");

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  const getStatusLabel = (id) => {
    const options = [
      { id: "pending", label: "Chờ xử lý" },
      { id: "confirmed", label: "Đã xác nhận" },
      { id: "inShipping", label: "Đang vận chuyển" },
      { id: "delivered", label: "Đã giao hàng" },
      { id: "rejected", label: "Đã bị từ chối" },
    ];
    const status = options.find((option) => option.id === id);
    return status ? status.label : "Không xác định"; // Trả về mặc định nếu không tìm thấy
  };

  // Hàm định dạng số với dấu chấm ngăn cách
  function formatNumberWithSeparator(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  console.log(orderDetails, "orderDetails");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gradient">Lịch sử đặt hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID đơn hàng</TableHead>
              <TableHead>Ngày đặt đơn</TableHead>
              <TableHead>Trạng thái đơn hàng</TableHead>
              <TableHead>Tổng thanh toán</TableHead>
              <TableHead>
                <span className="sr-only">Xem chi tiết</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0
              ? orderList.map((orderItem) => (
                  <TableRow>
                    <TableCell className="font-bold">
                      {orderItem?._id}
                    </TableCell>
                    <TableCell>
                      {new Date(orderItem?.orderDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          orderItem?.orderStatus === "pending"
                            ? "bg-blue-500"
                            : orderItem?.orderStatus === "confirmed"
                            ? "bg-purple-700"
                            : orderItem?.orderStatus === "inShipping"
                            ? "bg-green-500"
                            : orderItem?.orderStatus === "rejected"
                            ? "bg-red-600"
                            : "bg-black"
                        }`}
                      >
                        {getStatusLabel(orderItem?.orderStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatNumberWithSeparator(orderItem?.totalAmount)}đ
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                        >
                          Xem chi tiết
                        </Button>
                        <ShoppingOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
