import React from "react";
import { Bar } from "react-chartjs-2";

const InventoryChart = ({ data }) => {
  if (!data) return null;

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Sản phẩm tồn kho",
        data: data.values,
        backgroundColor: "rgba(153,102,255,0.4)",
        borderColor: "rgba(153,102,255,1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h3>Thống kê sản phẩm tồn kho</h3>
      <Bar data={chartData} />
    </div>
  );
};

export default InventoryChart;
