import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Filter } from "lucide-react";
// import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  return (
    <div className="bg-background rounded-lg shadow-md shadow-gray-500 text-back-500">
      <div className="p-5 border-b flex gap-2 items-center">
        {/* <Filter /> */}
        <h2 className="text-lg font-extrabold">Lọc </h2>
      </div>
      <div className="p-4 space-y-4">
        {/* lọc theo lại sản phẩm hoặc theo thương hiệu */}

        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-base font-bold">
                {filterOptions[keyItem].label}
              </h3>
              <div className="grid gap-2 mt-2">
                {filterOptions[keyItem].options.map((option) => (
                  <Label
                    key={option.id}
                    className="flex font-medium items-center gap-2"
                  >
                    {/* chọn các điều kiện lọc */}
                    {/* filters được lưu vào session - khi load lại trang các đk lọc trước đó sẽ được check*/}
                    {/* Trạng thái của checkbox (checked) sẽ là true hoặc false dựa trên các điều kiện trong biểu thức.
                    Nếu tất cả các điều kiện trên đều đúng, nghĩa là:
                      filters có dữ liệu,
                      mục keyItem tồn tại trong filters,
                      option.id nằm trong mảng filters[keyItem],
                    thì thuộc tính checked của checkbox sẽ là true, tức là checkbox sẽ được chọn (checked). 
                    Ngược lại, nếu bất kỳ điều kiện nào không thỏa mãn, checkbox sẽ bỏ chọn (checked = false).
                     */}
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItem] &&
                        filters[keyItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
