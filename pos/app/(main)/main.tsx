import AllowTypes from "@/modules/auth/allowTypes"
import BuyAction from "@/modules/checkout/components/buyAction/buyAction.main"
import Cart from "@/modules/checkout/components/cart/cart.main"
import TotalAmount from "@/modules/checkout/components/totalAmount/totalAmount.main"
import Customer from "@/modules/customer"
import ChooseType from "@/modules/orders/components/chooseType/chooseType.main"
import OrderDetail from "@/modules/orders/OrderDetail"
import Products from "@/modules/products"
import BarcodeResult from "@/modules/products/barcodeResult.market"
import Search from "@/modules/products/components/search/search.main"
import ProductCategories from "@/modules/products/productCategories.main"
import Slots from "@/modules/slots"

import { cn } from "@/lib/utils"
import BarcodeListener from "@/components/barcodeListener"
import Header from "@/components/header/header.main"

const MainIndexPage = () => {
  return (
    <BarcodeListener>
      <Header />
      <section className="flex flex-auto items-stretch overflow-hidden">
        <div className={cn("flex h-full w-2/3 flex-col p-4 pr-0")}>
          <div className="-mt-1 flex flex-none items-center pb-3 pr-3">
            <Search />
            <div className="flex flex-auto overflow-hidden">
              <ProductCategories />
            </div>
          </div>
          <div className="flex flex-auto overflow-hidden relative">
            <Slots />
            <Products />
            <BarcodeResult />
          </div>
        </div>
        <div className={"flex w-1/3 flex-col border-l"}>
          <AllowTypes>
            <OrderDetail>
              <div className="p-4">
                <Customer />
              </div>
              <Cart />
              <div className="grid flex-none grid-cols-2 gap-2 p-4">
                <TotalAmount />
                <ChooseType />
                <BuyAction />
              </div>
            </OrderDetail>
          </AllowTypes>
        </div>
      </section>
    </BarcodeListener>
  )
}

export default MainIndexPage
