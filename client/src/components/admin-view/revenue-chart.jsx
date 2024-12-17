import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ data }) => {
  // Chuẩn bị dữ liệu cho biểu đồ từ dữ liệu trả về
  const chartData = {
    labels: data.revenueByTimePeriod.map((item) => item.date), // Mảng các ngày từ dữ liệu
    datasets: [
      {
        label: "Doanh thu (đ)", // Thêm mô tả cho cột doanh thu
        data: data.revenueByTimePeriod.map((item) => item.revenue), // Doanh thu cho từng ngày
        backgroundColor: "#4CAF50", // Màu nền cho biểu đồ
      },
    ],
  };

  return (
    <div>
      <div className="w-full max-w-[900px] h-[600px] mx-auto ">
        {/* Giới hạn kích thước */}
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default RevenueChart;
