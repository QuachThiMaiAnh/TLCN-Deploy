import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRevenueStatistics,
  fetchOrderStatistics,
} from "../../store/admin/dashboard-slice";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RevenueChart from "./revenue-chart";
import StatisticCards from "./statistic-cards";
import OrderStatusChart from "./order-status-chart";

const StatisticsPage = () => {
  const dispatch = useDispatch();

  // Giá trị mặc định là ngày hôm nay
  const defaultDate = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(defaultDate);
  const [statType, setStatType] = useState("day");

  // State cho thống kê doanh thu và trạng thái đơn hàng
  const { isLoading, revenueStatistics, orderStatistics, error } = useSelector(
    (state) => state.adminStatistics
  );

  // Fetch dữ liệu doanh thu và trạng thái đơn hàng khi component render hoặc khi params thay đổi
  useEffect(() => {
    dispatch(fetchRevenueStatistics({ date: startDate, type: statType }));
    dispatch(fetchOrderStatistics({ date: startDate, type: statType }));
  }, [dispatch, startDate, statType]);

  // Xử lý khi submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchRevenueStatistics({ date: startDate, type: statType }));
    dispatch(fetchOrderStatistics({ date: startDate, type: statType }));
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className=" text-gradient mb-4">Thống kê</h1>
      </div>

      {/* Cards Tổng Quan */}
      <StatisticCards
        revenue={revenueStatistics}
        totalOrders={orderStatistics.todayTotalOrders}
      />

      {/* Form Chọn Tham Số */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Thống kê theo thời gian</h2>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 lg:flex-row mb-4"
          >
            {/* Input Ngày Bắt Đầu */}
            <div className="flex flex-col gap-2 w-full lg:w-1/2">
              <Label htmlFor="startDate" className="font-bold">
                Ngày bắt đầu
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* Select Loại Thống Kê */}
            <div className="flex flex-col gap-2 w-full lg:w-1/3">
              <Label className="font-bold">Loại thống kê</Label>
              <Select
                value={statType}
                onValueChange={(value) => setStatType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại thống kê" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="quarter">Quý</SelectItem>
                  <SelectItem value="year">Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Button Submit */}
            <div className="flex items-end">
              <Button type="submit" className="w-full lg:w-auto">
                Lấy dữ liệu
              </Button>
            </div>
          </form>

          {/* Trạng Thái Tải Dữ Liệu */}
          {isLoading && <p className="text-gray-500">Đang tải dữ liệu...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {/* Biểu Đồ Doanh Thu */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Biểu đồ doanh thu</h2>
        </CardHeader>
        <CardContent>
          {revenueStatistics && <RevenueChart data={revenueStatistics} />}
        </CardContent>
      </Card>

      {/* Biểu Đồ Trạng Thái Đơn Hàng */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Biểu đồ trạng thái đơn hàng</h2>
        </CardHeader>
        <CardContent>
          {orderStatistics?.orderStats?.length > 0 ? (
            <OrderStatusChart data={orderStatistics.orderStats} />
          ) : (
            <p className="text-gray-500">
              Không có dữ liệu trạng thái đơn hàng.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPage;
