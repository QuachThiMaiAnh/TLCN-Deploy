import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import ArrowLeftIcon from "@/components/common/ArrowLeftIcon";
import ArrowRightIcon from "@/components/common/ArrowRightIcon";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  /**
   * Data filter VD: {category: Array(2), brand: Array(2)}
   * key- value
      (cặp 1) brand: ['nike', 'adidas']
      (cặp 2) category: ['men', 'women']
      
   * tạo chuỗi tham số truy vấn (query string) từ một đối tượng filterParams,
   * sử dụng để thêm vào URL cho các yêu cầu HTTP hoặc điều hướng trang web.
   * Object.entries(filterParams) sẽ tạo ra một mảng các cặp [key, value] từ filterParams. Sử dụng for...of, đoạn mã duyệt qua từng cặp
   * Array.isArray(value) kiểm tra xem value có phải là một mảng hay không? value.length > 0 kiểm tra xem mảng này có phần tử nào không.
   * value.join(",") kết hợp các phần tử của mảng value thành một chuỗi:  value = ["men", "women"], paramValue sẽ là "men,women".
   * encodeURIComponent(paramValue) : các ký tự đặc biệt chuyển thành các ký tự an toàn cho URL.
   * thêm chuỗi tham số dạng "key=value" vào mảng queryParams :"category=men%2Cwomen"
   * queryParams.join("&") kết hợp các phần tử trong mảng queryParams thành một chuỗi: "category=men%2Cwomen&brand=nike%2Cadidas".
   */
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");

      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }
  // console.log(queryParams, "queryParams");

  return queryParams.join("&");
}

function ShoppingListing() {
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang
  const [pageSize, setPageSize] = useState(8); // Số sản phẩm trên mỗi trang
  const dispatch = useDispatch();
  const { productList, productDetails, totalCount } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { toast } = useToast();

  const categorySearchParam = searchParams.get("category");

  function goToNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }

  function goToPreviousPage() {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  }

  function handleSort(value) {
    setSort(value);
  }

  function handleFilter(getSectionId, getCurrentOption) {
    /**
    xử lý việc thêm hoặc xóa một tùy chọn vào một mục lọc cụ thể (như "brand" hoặc "category")
    keyItem, option.id
    sao chép filters hiện tại vào cpyFilters để tránh làm thay đổi dữ liệu gốc trực tiếp.
    indexOfCurrentSection kiểm tra mục này có tồn tại trong cpyFilters chưa
    Nếu chưa tồn tại (indexOfCurrentSection === -1),
    nghĩa là mục lọc này chưa có dữ liệu, nên nó sẽ thêm một mảng mới chứa getCurrentOption vào cpyFilters.
    indexOf tìm vị trí của getCurrentOption trong mảng cpyFilters[getSectionId]
    Nếu indexOfCurrentOption === -1, tức là getCurrentOption chưa có trong mục lọc getSectionId, nên nó sẽ thêm tùy chọn đó vào.
    Nếu indexOfCurrentOption khác -1, nghĩa là tùy chọn này đã có sẵn trong mục lọc, thì nó sẽ xóa tùy chọn đó.
    xóa 1 phần tử bắt đầu tù vị trí đầu tiên tìm thấy nó trong mảng cpyFilters
    Sau khi cập nhật cpyFilters, nó lưu cpyFilters vào sessionStorage dưới dạng JSON
    để đảm bảo dữ liệu được lưu trữ tạm thời và có thể khôi phục khi người dùng tải lại trang.
   */
    let cpyFilters = { ...filters };

    const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);
    if (indexOfCurrentSection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption],
      };
    } else {
      const indexOfCurrentOption =
        cpyFilters[getSectionId].indexOf(getCurrentOption);
      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }
    setFilters(cpyFilters);

    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  function handleGetProductDetails(getCurrentProductId) {
    // console.log(getCurrentProductId);
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    // console.log(cartItems);
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Chỉ có thể thêm số lượng tối đa là ${getQuantity} cho mặt hàng này`,
            variant: "destructive",
          });

          return;
        }
      }
    }

    // gọi Api thêm sản phẩm
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        // gọi Api lấy toàn bộ sản phẩm trong giỏ hàng
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Đã thêm sản phẩm vào giỏ hàng!",
        });
      }
    });
  }

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [categorySearchParam]);
  // console.log(categorySearchParam, "cateSearch");

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
    setCurrentPage(1);
  }, [filters]);

  // lấy toàn bộ sản phẩm ( có lọc + sắp xếp)
  useEffect(() => {
    if (filters !== null && sort !== null)
      dispatch(
        fetchAllFilteredProducts({
          filterParams: filters,
          sortParams: sort,
          page: currentPage,
          pageSize,
        })
      ).then((response) => {
        // Kiểm tra xem API có trả về totalPages không
        if (response?.payload?.totalPages) {
          setTotalPages(response.payload.totalPages);
        }
      });
  }, [dispatch, filters, sort, currentPage, pageSize]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  console.log(productList, "productList");
  // console.log(filters);
  // console.log(productDetails);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 p-4 md:p-6 ">
      {/* lọc sản phẩm */}
      <ProductFilter filters={filters} handleFilter={handleFilter} />

      <div className="bg-background w-full rounded-lg shadow-sm">
        {/* dàn đều về hai bên */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Danh sách sản phẩm</h2>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              Bao gồm {productList?.length} /{totalCount} sản phẩm
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span>Sắp xếp theo</span>
                </Button>
              </DropdownMenuTrigger>
              {/* căn về phía cuối của phần tử trigger */}
              <DropdownMenuContent align="end" className="w-[200px]">
                {/* chỉ cho phép chọn duy nhất một tùy chọn trong nhóm này được chọn tại một thời điểm. */}
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* hiển thị danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {productList && productList.length > 0
            ? productList.map((productItem) => (
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                />
              ))
            : null}
        </div>

        {/* Hiện thị phân trang */}
        <div className="flex justify-center items-center mt-4 gap-4 ">
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
      </div>

      <ProductDetailsDialog
        // mở dialog khi open = true
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingListing;
