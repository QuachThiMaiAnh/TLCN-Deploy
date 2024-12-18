import AdminProductTile from "@/components/admin-view/product-tile";
import ProductImageUpload from "@/components/admin-view/image-upload";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ArrowLeftIcon from "../../components/common/ArrowLeftIcon";
import ArrowRightIcon from "../../components/common/ArrowRightIcon";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProductFilterForm from "../../components/admin-view/product-flter";

const initialFormData = {
  images: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
  colors: [], // Danh sách màu
  sizes: [], // Danh sách kích thước
};

function AdminProducts() {
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize, setPageSize] = useState(2); // Trang hiện tại
  // Lấy dữ liệu sản phẩm từ Redux store
  const { products, totalPages, productList, totalCount, error } = useSelector(
    (state) => state.adminProducts
  );

  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleRemoveColor(index) {
    const newColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: newColors });
  }

  function handleUploadColorImage(index) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const data = new FormData();
      data.append("my_files", file);

      try {
        const response = await axios.post(
          "https://tlcn-deploy-1.onrender.com/api/admin/products/upload-image",
          data
        );

        if (response?.data?.success) {
          const uploadedUrl = response.data.results?.[0].url;

          // Cập nhật formData.colors
          const newColors = [...(formData.colors || [])]; // Đảm bảo colors luôn tồn tại
          if (!newColors[index]) {
            newColors[index] = { image: "" }; // Khởi tạo đối tượng nếu chưa tồn tại
          }
          newColors[index].image = uploadedUrl;

          setFormData({ ...formData, colors: newColors });
        }
      } catch (error) {
        console.error("Lỗi tải ảnh:", error);
      }
    };

    fileInput.click();
  }

  function handleAddSize(colorIndex) {
    const newColors = [...formData.colors];
    if (!newColors[colorIndex].sizes) {
      newColors[colorIndex].sizes = [];
    }
    newColors[colorIndex].sizes.push({ size: "", quantity: 0 });
    setFormData({ ...formData, colors: newColors });
  }

  function handleAddDefaultSizes(colorIndex, defaultType) {
    const newSizes =
      defaultType === "clothing"
        ? ["XS", "S", "M", "L", "XL", "XXL"]
        : defaultType === "shoes"
        ? ["35", "36", "37", "38", "39", "40", "41", "42"]
        : ["Free-size"];

    const newColors = [...formData.colors];
    const existingSizes = newColors[colorIndex].sizes || [];

    newColors[colorIndex].sizes = [
      ...existingSizes,
      ...newSizes
        .filter((size) => !existingSizes.some((s) => s.size === size)) // Tránh trùng lặp
        .map((size) => ({
          size,
          quantity: 0,
        })),
    ];
    setFormData({ ...formData, colors: newColors });
  }

  // Xử lý xóa số 0 mặc định trong ô số lượng
  function handleFocusQuantity(e) {
    if (e.target.value === "0" || e.target.value === "NaN") {
      e.target.value = ""; // Xóa giá trị tạm thời để người dùng nhập
    }
  }

  // Đảm bảo số lượng không bị null khi mất focus
  function handleBlurQuantity(e, colorIndex, sizeIndex) {
    const value = e.target.value.trim(); // Lấy giá trị từ input
    const parsedValue = value === "" ? 0 : Number(value); // Xử lý giá trị rỗng thành 0
    handleSizeChange(colorIndex, sizeIndex, "quantity", parsedValue); // Cập nhật state
  }

  function handleRemoveSize(colorIndex, sizeIndex) {
    const newColors = [...formData.colors];
    newColors[colorIndex].sizes = newColors[colorIndex].sizes.filter(
      (_, i) => i !== sizeIndex
    );
    setFormData({ ...formData, colors: newColors });
  }

  function handleSizeChange(colorIndex, sizeIndex, field, value) {
    const newColors = [...formData.colors]; // Sao chép mảng colors
    const newSizes = [...newColors[colorIndex].sizes]; // Sao chép mảng sizes

    // Sao chép đối tượng kích thước
    const updatedSize = {
      ...newSizes[sizeIndex],
      [field]: value, // Chỉ cập nhật trường cần thay đổi
    };

    // Cập nhật lại mảng sizes
    newSizes[sizeIndex] = updatedSize;

    // Cập nhật lại mảng colors
    newColors[colorIndex] = {
      ...newColors[colorIndex],
      sizes: newSizes,
    };

    // Cập nhật lại formData
    setFormData({
      ...formData,
      colors: newColors,
    });
  }

  useEffect(() => {
    if (error) {
      toast({
        title: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

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

  function onSubmit(event) {
    event.preventDefault();

    // Kiểm tra nếu không có URL ảnh nào
    if (!uploadedImageUrls || uploadedImageUrls.length === 0) {
      toast({
        title: "Vui lòng thêm ít nhất một hình ảnh cho sản phẩm!",
        variant: "destructive",
      });
      return;
    }
    // Nếu đang chỉnh sửa sản phẩm
    if (currentEditedId !== null) {
      dispatch(
        editProduct({
          id: currentEditedId,
          formData,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          toast({
            title: "Sửa thông tin sản phẩm thành công!",
          });
          dispatch(fetchAllProducts({ page: currentPage, pageSize }));
          setFormData(initialFormData);
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setUploadedImageUrls([]); // Reset danh sách ảnh
        } else {
          toast({
            title:
              "Sửa sản phẩm không thành công do giá bán nhỏ hơn giá khuyến mãi!",
            variant: "destructive",
          });
        }
      });
    } else {
      // Nếu thêm mới sản phẩm
      dispatch(
        addNewProduct({
          ...formData,
          images: uploadedImageUrls, // Gửi danh sách ảnh đã tải lên
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts({ page: currentPage, pageSize }));
          setOpenCreateProductsDialog(false);
          setImageFiles(null);
          setFormData(initialFormData);
          setUploadedImageUrls([]); // Reset danh sách ảnh
          toast({
            title: "Thêm sản phẩm mới thành công!",
          });
        } else {
          toast({
            title:
              "Thêm sản phẩm không thành công do giá bán nhỏ hơn giá khuyến mãi!",
            variant: "destructive",
          });
        }
      });
    }
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts({ page: currentPage, pageSize }));
      }
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  // Gửi request lấy sản phẩm khi thay đổi trang hoặc bộ lọc
  useEffect(() => {
    dispatch(
      fetchAllProducts({ ...filters, page: currentPage, pageSize: pageSize })
    );
  }, [dispatch, currentPage, filters]);

  // Hàm cập nhật bộ lọc khi thay đổi
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Khi thay đổi bộ lọc, reset về trang đầu tiên
  };

  useEffect(() => {
    setFormData({ ...formData, images: uploadedImageUrls });
  }, [uploadedImageUrls]);
  console.log(formData, "formData");

  return (
    <Fragment>
      {/* Form lọc sản phẩm, truyền setCurrentPage để thay đổi trang */}
      <ProductFilterForm
        setCurrentPage={setCurrentPage}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="mt-4 mb-5 w-full flex justify-between items-center">
        <div className="flex items-center gap-12">
          <p className="text-gradient">Tất cả sản phẩm</p>
          <Label className="">
            <Badge className="py-1 px-3 bg-white border-black shadow-inner shadow-black text-black hover:bg-white">
              Hiển thị {productList.length} / {totalCount} sản phẩm
            </Badge>
          </Label>
        </div>
        {/* click để mở form thêm sản phẩm mới */}
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Thêm sản phẩm mới
        </Button>
      </div>
      {/* Hiển thị danh sách sản phẩm */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
                setUploadedImageUrls={setUploadedImageUrls} // Thêm prop này
                setImageFiles={setImageFiles}
              />
            ))
          : null}
      </div>

      {/* Hiện thị phân trang */}
      <div className="flex justify-center items-center mt-4 gap-4">
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
      {/* mở ra khi form thêm sản phẩm được gọi */}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          // khi dialog được mở lại một lần nữa thì thông tin form phải được clear lại
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto lg:max-w-3xl">
          <SheetHeader>
            <SheetTitle className="text-xl font-extrabold text-gradient">
              {currentEditedId !== null
                ? "Chỉnh sửa sản phẩm"
                : "Thêm mới sản phẩm"}
            </SheetTitle>
          </SheetHeader>

          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls} // Danh sách URL ảnh
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
          />

          {/* Màu sắc */}
          <div className="py-4 text-md">
            <Label className="font-bold ">Màu sản phẩm</Label>
            <div className="flex flex-col gap-4 mt-4 ">
              {formData.colors.map((color, colorIndex) => (
                <div
                  key={colorIndex}
                  className="flex flex-col gap-4 p-4 border-solid border-blue-500 border-[1px] rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border rounded-md overflow-hidden">
                      {color.image ? (
                        <img
                          src={color.image}
                          alt={color.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 flex items-center justify-center h-full">
                          Hình ảnh
                        </span>
                      )}
                    </div>

                    <Input
                      type="text"
                      placeholder="Tên màu sắc sản phẩm (VD: Đỏ)"
                      value={color.name}
                      className="border px-2 py-1 rounded-md flex-1"
                      onChange={(e) => {
                        const newColors = [...formData.colors];
                        newColors[colorIndex].name = e.target.value;
                        setFormData({ ...formData, colors: newColors });
                      }}
                    />

                    <Button
                      variant="outline"
                      className="flex-shrink-0 bg-white hover:bg-blue-100"
                      onClick={() => handleUploadColorImage(colorIndex)}
                    >
                      Tải ảnh lên
                    </Button>

                    <Button
                      variant="destructive"
                      className="flex-shrink-0"
                      onClick={() => handleRemoveColor(colorIndex)}
                    >
                      Xóa
                    </Button>
                  </div>

                  {/* Kích thước và số lượng */}
                  <div className="flex flex-col gap-2 mt-2 ">
                    <Label className="font-bold">Kích thước & Số lượng:</Label>
                    {color.sizes?.map((size, sizeIndex) => (
                      <div
                        key={sizeIndex}
                        className="flex items-center gap-4 border p-2 rounded"
                      >
                        {/* Kích thước */}
                        <Input
                          type="text"
                          placeholder="Kích thước (VD: 39, 40, XS, S)"
                          value={size.size}
                          className="border px-2 py-1 rounded-md flex-1"
                          onChange={(e) =>
                            handleSizeChange(
                              colorIndex,
                              sizeIndex,
                              "size",
                              e.target.value
                            )
                          }
                        />

                        {/* Số lượng */}
                        <Input
                          // type="number"
                          placeholder="Số lượng tồn kho"
                          value={size.quantity}
                          className="border px-2 py-1 rounded-md flex-1"
                          onFocus={handleFocusQuantity}
                          onBlur={(e) =>
                            handleBlurQuantity(e, colorIndex, sizeIndex)
                          }
                          onChange={(e) =>
                            handleSizeChange(
                              colorIndex,
                              sizeIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                        />

                        {/* Xóa kích thước */}
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleRemoveSize(colorIndex, sizeIndex)
                          }
                        >
                          Xóa
                        </Button>
                      </div>
                    ))}

                    {/* Thêm kích thước mới */}
                    <div className="flex gap-4 flex ">
                      <Button
                        className="mt-2 w-1/3 bg-blue-950 hover:bg-primary"
                        onClick={() => handleAddSize(colorIndex)}
                      >
                        Thêm kích thước mới
                      </Button>

                      {/* Kích thước mặc định */}
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button className="mt-2 bg-blue-900 hover:bg-primary">
                            Chọn kích thước mặc định
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAddDefaultSizes(colorIndex, "clothing")
                            }
                          >
                            Quần áo (XS - XXL)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAddDefaultSizes(colorIndex, "shoes")
                            }
                          >
                            Giày dép (35 - 42)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAddDefaultSizes(colorIndex, "free-size")
                            }
                          >
                            Free-size
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}

              {/* Thêm màu mới */}
              <Button
                className="w-1/3 bg-gradient-to-r from-blue-500 to-pink-400 text-black py-2 px-4 
                rounded-lg shadow-md hover:from-blue-6200 hover:to-purple-400 transition-all duration-300 font-bold"
                onClick={() =>
                  setFormData({
                    ...formData,
                    colors: [
                      ...formData.colors,
                      { name: "", image: "", sizes: [] },
                    ],
                  })
                }
              >
                Thêm màu sản phẩm mới
              </Button>
            </div>
          </div>

          {/* Form chung */}
          <div className="py-6 ">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Sửa" : "Thêm"}
              formControls={addProductFormElements}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
