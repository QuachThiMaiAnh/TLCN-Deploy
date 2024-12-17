import React from "react";
import { Bar } from "react-chartjs-2";

const SoldProductsChart = ({ data }) => {
  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: data.map((product) => product.title), // Tên sản phẩm
    datasets: [
      {
        label: "Số lượng bán",
        data: data.map((product) => product.totalSold), // Tổng số lượng bán
        backgroundColor: "#36A2EB", // Màu sắc của cột
      },
    ],
  };

  // Tùy chọn biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Sản phẩm",
        },
        ticks: {
          autoSkip: false, // Không tự động bỏ qua nhãn
          maxRotation: 90,
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: "Số lượng bán",
        },
      },
    },
  };

  return (
    <div style={{ height: "400px" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default SoldProductsChart;
