import React from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Thêm plugin

const OrderStatusChart = ({ data }) => {
  // Ánh xạ trạng thái sang tiếng Việt
  const statusMapping = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    inShipping: "Đang vận chuyển",
    delivered: "Đã giao hàng",
    rejected: "Đã bị từ chối",
  };

  const chartData = {
    labels: data.map((item) => statusMapping[item._id] || "Chưa xác định"),
    datasets: [
      {
        label: "Số lượng đơn hàng",
        data: data.map((item) => item.count),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#9C27B0",
          "#FF5733",
          ,
        ],
        hoverOffset: 5, // Hiệu ứng hover
      },
    ],
  };

  // Tùy chỉnh thêm plugin để hiển thị số đơn hàng trên biểu đồ
  const options = {
    plugins: {
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: (value) => value + "", // Hiển thị số lượng đơn hàng
      },
    },
  };

  return (
    <div style={{ width: "50%", margin: "0 auto", textAlign: "center" }}>
      <Pie data={chartData} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};

export default OrderStatusChart;
