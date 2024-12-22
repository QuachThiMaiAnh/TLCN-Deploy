import { Button } from "@/components/ui/button";
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.webp";
import bannerThree from "../../assets/banner-3.webp";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from "lucide-react";
import nikeIcon from "../../assets/icons/Nike.png";
import adidasIcon from "../../assets/icons/Adidas.png";
import pumaIcon from "../../assets/icons/Puma.png";
import levisIcon from "../../assets/icons/Levis.png";
import zaraIcon from "../../assets/icons/Zara.png";
import hmIcon from "../../assets/icons/HM.png";
import menIcon from "../../assets/icons/Men.png";
import womenIcon from "../../assets/icons/Women.png";
import accessoriesIcon from "../../assets/icons/Accessories.png";
import kidsIcon from "../../assets/icons/Kids.png";
import footwearIcon from "../../assets/icons/Footwear.png";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common/feature";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: menIcon },
  { id: "women", label: "Women", icon: womenIcon },
  { id: "kids", label: "Kids", icon: kidsIcon },
  { id: "accessories", label: "Accessories", icon: accessoriesIcon },
  { id: "footwear", label: "Footwear", icon: footwearIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: nikeIcon },
  { id: "adidas", label: "Adidas", icon: adidasIcon },
  { id: "puma", label: "Puma", icon: pumaIcon },
  { id: "levi", label: "Levi's", icon: levisIcon },
  { id: "zara", label: "Zara", icon: zaraIcon },
  { id: "h&m", label: "H&M", icon: hmIcon },
];
function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      // category: men,kids
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }
  // console.log(productDetails);
  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Sản phẩm đã được thêm vào giỏ hàng!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  // lấy thông tin sản phẩm để hiển thị lên home page
  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  // console.log(productList, "productList");

  // Tạo slider tự động chuyển ảnh mỗi 5 giây khi featureImageList thay đổi
  useEffect(() => {
    if (
      featureImageList.length > 0 &&
      featureImageList.some((item) => item.images.length > 0)
    ) {
      const timer = setInterval(() => {
        setCurrentSlide(
          (prevSlide) =>
            (prevSlide + 1) %
            featureImageList.flatMap((item) => item.images).length
        );
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [featureImageList]);

  // Xử lý di chuyển qua lại các slide
  function handlePrevSlide() {
    setCurrentSlide(
      (prevSlide) =>
        (prevSlide -
          1 +
          featureImageList.flatMap((item) => item.images).length) %
        featureImageList.flatMap((item) => item.images).length
    );
  }

  function handleNextSlide() {
    setCurrentSlide(
      (prevSlide) =>
        (prevSlide + 1) % featureImageList.flatMap((item) => item.images).length
    );
  }

  // Lấy hình ảnh banner khi component được mount hoặc featureImageList thay đổi
  useEffect(() => {
    dispatch(getFeatureImages()); // Lấy ảnh khi component mount hoặc khi danh sách ảnh thay đổi
  }, [dispatch]);

  // Tạo danh sách hình ảnh từ tất cả các mảng images
  const allImages = featureImageList.flatMap((item) => item.images);

  console.log(featureImageList);
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-[600px] overflow-hidden">
        {/* Kiểm tra featureImageList có ảnh và lấy ảnh từ mảng */}
        {allImages.length > 0
          ? allImages.map((imageUrl, imageIndex) => (
              <img
                key={imageIndex}
                src={imageUrl}
                className={`${
                  imageIndex === currentSlide ? "opacity-100" : "opacity-0"
                } absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000`}
              />
            ))
          : null}

        {/* Button chuyển đến slide trước */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>

        {/* Button chuyển đến slide sau */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* category */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Mua sắm theo danh mục
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithIcon.map((categoryItem) => {
              // Lấy ảnh đầu tiên từ danh sách sản phẩm trong danh mục tương ứng
              const firstProduct = productList.find(
                (product) => product.category === categoryItem.id
              );
              const firstProductImage = firstProduct?.images?.[0] || null;

              return (
                <Card
                  key={categoryItem.id}
                  onClick={() =>
                    handleNavigateToListingPage(categoryItem, "category")
                  }
                  className={`cursor-pointer border-blue-200 border-4 hover:shadow-xl transition-shadow ${
                    firstProductImage ? "bg-cover" : "bg-gray-200"
                  }`}
                  style={
                    firstProductImage
                      ? { backgroundImage: `url(${firstProductImage})` }
                      : {}
                  }
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 bg-gray-900 bg-opacity-50 rounded">
                    {/* Sử dụng thẻ img thay vì component */}
                    <img
                      src={categoryItem.icon}
                      alt={categoryItem.label}
                      className="w-20 h-20 "
                    />
                    <span className="font-bold text-white">
                      {categoryItem.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Mua sắm theo thương hiệu
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandsWithIcon.map((brandItem) => {
              const productsForBrand = productList.filter(
                (product) => product.brand === brandItem.id
              );

              const secondProductImage =
                productsForBrand.length >= 2
                  ? productsForBrand[1]?.images[0]
                  : null;

              return (
                <Card
                  key={brandItem.id}
                  onClick={() =>
                    handleNavigateToListingPage(brandItem, "brand")
                  }
                  className={`cursor-pointer border-blue-200 border-4 hover:shadow-lg transition-shadow ${
                    secondProductImage ? "bg-cover" : "bg-gray-200"
                  }`}
                  style={
                    secondProductImage
                      ? { backgroundImage: `url(${secondProductImage})` }
                      : {}
                  }
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 bg-gray-900 bg-opacity-50 rounded">
                    {/* Sử dụng thẻ img thay vì component */}
                    <img
                      src={brandItem.icon}
                      alt={brandItem.label}
                      className="w-20 h-20 "
                    />
                    <span className="font-bold text-white">
                      {brandItem.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Sản phẩm nổi bật
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        </div>
      </section>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
