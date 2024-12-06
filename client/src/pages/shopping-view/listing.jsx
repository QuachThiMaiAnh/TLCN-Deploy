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

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }
  return queryParams.join("&");
}

function ShoppingListing() {
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize, setPageSize] = useState(4); // Số sản phẩm trên mỗi trang
  const dispatch = useDispatch();
  const { productList, productDetails, totalCount, totalPages } = useSelector(
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
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddToCart(productId, colorId, sizeId, quantity) {
    if (!colorId || !sizeId) {
      toast({
        title:
          "Vui lòng chọn màu sắc và kích thước trước khi thêm vào giỏ hàng.",
        variant: "destructive",
      });
      return;
    }

    const items = cartItems?.items || []; // Giá trị mặc định nếu items không tồn tại

    let existingItem = items.find(
      (item) =>
        item.productId === productId &&
        item.colorId === colorId &&
        item.sizeId === sizeId
    );

    if (
      existingItem &&
      existingItem.quantity + quantity > selectedSize?.quantity
    ) {
      toast({
        title: `Chỉ có thể thêm tối đa ${selectedSize?.quantity} sản phẩm.`,
        variant: "destructive",
      });
      return;
    }
    console.log(colorId, sizeId, "colorId, sizeId");
    dispatch(
      addToCart({
        userId: user?.id,
        productId,
        colorId,
        sizeId,
        quantity,
      })
    ).then((data) => {
      if (data?.payload?.success) {
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

  console.log(categorySearchParam, "cateSearch");

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
    setCurrentPage(1);
  }, [filters]);
  // console.log(searchParams, "searchParam");

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
      );
  }, [dispatch, filters, sort, currentPage, pageSize]);

  console.log(filters, sort, "filter, sort");

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  console.log(productList, "productList");
  console.log(productDetails, "productDetails");

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
                  handleAddToCart={handleAddToCart}
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
