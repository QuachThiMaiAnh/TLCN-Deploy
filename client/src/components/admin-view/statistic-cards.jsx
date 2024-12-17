import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const StatisticCards = ({ revenue, totalOrders }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Doanh thu */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Doanh thu hôm nay</h2>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {revenue.todayRevenue
              ? revenue.todayRevenue.toLocaleString() + " đ"
              : "0 đ"}
          </p>
        </CardContent>
      </Card>

      {/* Tổng đơn hàng */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Đơn hàng hôm nay</h2>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </CardContent>
      </Card>

      {/* Sản phẩm trong kho */}
      {/* <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Sản phẩm tồn kho</h2>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default StatisticCards;
