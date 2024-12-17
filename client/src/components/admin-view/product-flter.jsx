import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const ProductFilterForm = ({ setCurrentPage, filters, onFilterChange }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSearchChange = (e) => {
    const { value } = e.target;
    onFilterChange({ ...filters, search: value });
  };

  const handleClearFilters = () => {
    // Reset lại các bộ lọc và chuyển về trang 1
    onFilterChange({
      category: "",
      brand: "",
      search: "",
    });
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  return (
    <form className="flex justify-between bg-blue-50 p-4 rounded-lg shadow-gray-500 shadow-md">
      <div className="form-group flex gap-4 items-center ">
        <Label className="font-bold">Loại sản phẩm</Label>
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="rounded-md p-2 text-sm border-blue-300 border-[1px]"
        >
          <option value="">Chọn loại sản phẩm</option>
          <option value="men">Nam</option>
          <option value="women">Nữ</option>
          <option value="kids">Trẻ em</option>
          <option value="accessories">Phụ kiện</option>
          <option value="footwear">Giày dép</option>
        </select>
      </div>

      <div className="form-group flex gap-4 items-center">
        <Label className="font-bold">Thương hiệu</Label>
        <select
          name="brand"
          value={filters.brand}
          onChange={handleFilterChange}
          className="rounded-md p-2 text-sm border-blue-300 border-[1px]"
        >
          <option value="">Chọn thương hiệu</option>
          <option value="nike">Nike</option>
          <option value="adidas">Adidas</option>
          <option value="puma">Puma</option>
          <option value="levi">Levi's</option>
          <option value="zara">Zara</option>
          <option value="h&m">H&M</option>
        </select>
      </div>

      <div className="form-group flex gap-4 items-center">
        <Label className="font-bold whitespace-nowrap">Tìm kiếm sản phẩm</Label>
        <Input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Tìm kiếm sản phẩm..."
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          onClick={handleClearFilters} // Gọi hàm xóa bộ lọc
          className="bg-gray-500 text-white rounded-md px-4 py-2 hover:bg-red-300"
        >
          Xóa bộ lọc
        </Button>
      </div>
    </form>
  );
};

export default ProductFilterForm;
