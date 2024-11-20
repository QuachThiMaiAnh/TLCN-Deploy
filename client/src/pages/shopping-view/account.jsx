import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.png";
import Address from "@/components/shopping-view/address";
// import ShoppingOrders from "@/components/shopping-view/orders";

function ShoppingAccount() {
  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        {/* Ảnh trên trang account */}
        <img
          src={accImg}
          className="h-full w-full object-cover object-left-top "
        />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-8 py-8">
        <div className="flex flex-col rounded-lg border bg-background p-4 shadow-sm">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger className="font-extrabold text-xl" value="orders">
                Đơn hàng
              </TabsTrigger>
              <TabsTrigger className="font-extrabold text-xl" value="address">
                Địa chỉ
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders">{/* <ShoppingOrders /> */}</TabsContent>
            <TabsContent value="address">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
