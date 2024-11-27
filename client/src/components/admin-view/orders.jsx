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
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import ArrowLeftIcon from "../common/ArrowLeftIcon";
import ArrowRightIcon from "../common/ArrowRightIcon";
import { Label } from "../ui/label";

function AdminOrdersView() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Số đơn hàng mỗi trang
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails, totalCount } = useSelector(
    (state) => state.adminOrder
  );
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  // Xử lý chuyển trang
  // const totalPages = Math.ceil(orderList?.totalCount / pageSize);
  const totalPages =
    totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 1;

  function goToNextPage() {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }

  function goToPreviousPage() {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
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
    dispatch(getAllOrdersForAdmin({ page: currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]); // pageSize cần có nếu bạn muốn hỗ trợ thay đổi số lượng đơn hàng mỗi trang

  // useEffect(() => {
  //   dispatch(getAllOrdersForAdmin());
  // }, [dispatch]);

  console.log(orderDetails, "orderDetails");

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-12">
          <CardTitle className="text-gradient">Tất cả đơn hàng</CardTitle>
          <Label className="">
            <Badge className="py-1 px-3 bg-white border-black shadow-inner shadow-black text-black hover:bg-white">
              Hiển thị {orderList.length} / {totalCount} đơn hàng
            </Badge>
          </Label>
        </div>
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
                      {" "}
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
                        <AdminOrderDetailsView
                          orderDetails={orderDetails}
                          pageSize={pageSize}
                          currentPage={currentPage}
                        />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
        {/* Hiển thị phân trang */}

        <div className="flex justify-center items-center mt-4 gap-4">
          <button
            className="w-10 h-10 flex justify-center items-center border rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
          >
            {/* Mũi tên trái */}
            <ArrowLeftIcon className="w-6 h-6 " />
          </button>

          <span className="font-bold">
            Trang <span>{currentPage}</span> / {totalPages}
          </span>

          <button
            className="w-10 h-10 flex justify-center items-center border rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
            disabled={currentPage === totalPages}
            onClick={goToNextPage}
          >
            {/* Mũi tên phải */}
            <ArrowRightIcon className="w-6 h-6" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
