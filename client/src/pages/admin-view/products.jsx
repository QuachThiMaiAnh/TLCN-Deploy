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
// import { useToast } from "@/components/ui/use-toast";
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
};

function AdminProducts() {
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang
  const [pageSize, setPageSize] = useState(4); // Số sản phẩm trên mỗi trang

  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList, totalCount } = useSelector(
    (state) => state.adminProducts
  );
  const dispatch = useDispatch();
  const { toast } = useToast();

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

  // function onSubmit(event) {
  //   event.preventDefault();

  //   currentEditedId !== null
  //     ? dispatch(
  //         editProduct({
  //           id: currentEditedId,
  //           formData,
  //         })
  //       ).then((data) => {
  //         console.log(data, "Sửa thông tin sản phẩm");
  //         if (data?.payload?.success) {
  //           toast({
  //             title: "Sửa thông tin sản phẩm thành công!",
  //           });
  //           dispatch(fetchAllProducts({ page: currentPage, pageSize }));
  //           setFormData(initialFormData);
  //           setOpenCreateProductsDialog(false);
  //           setCurrentEditedId(null);
  //         } else {
  //           toast({
  //             title:
  //               "Sửa sản phẩm không thành công do giá bán nhỏ hơn giá khuyến mãi!",
  //             variant: "destructive",
  //           });
  //         }
  //       })
  //     : dispatch(
  //         addNewProduct({
  //           ...formData,
  //           images: uploadedImageUrls,
  //         })
  //       ).then((data) => {
  //         if (data?.payload?.success) {
  //           dispatch(fetchAllProducts({ page: currentPage, pageSize }));
  //           setOpenCreateProductsDialog(false);
  //           setImageFiles(null);
  //           setFormData(initialFormData);
  //           toast({
  //             title: "Thêm sản phẩm mới thành công!",
  //           });
  //         } else {
  //           toast({
  //             title:
  //               "Thêm sản phẩm không thành công do giá bán nhỏ hơn giá khuyến mãi!",
  //             variant: "destructive",
  //           });
  //         }
  //       });
  // }

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
    console.log(uploadedImageUrls, "uploadedImageUrls");
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

  useEffect(() => {
    dispatch(fetchAllProducts({ page: currentPage, pageSize })).then(
      (response) => {
        // Kiểm tra xem API có trả về totalPages không
        if (response?.payload?.totalPages) {
          setTotalPages(response.payload.totalPages);
        }
      }
    );
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    setFormData({ ...formData, images: uploadedImageUrls });
  }, [uploadedImageUrls]);
  console.log(formData, "formData");

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-between items-center">
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
          {/* <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            // isEditMode={currentEditedId !== null}
            currentEditedId={currentEditedId}
          /> */}

          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls} // Danh sách URL ảnh
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            currentEditedId={currentEditedId}
          />

          <div className="py-6 ">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Sửa" : "Thêm"}
              formControls={addProductFormElements}
              // isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
