import Cart from "@/modules/checkout/components/cart/cart.market"
import Checkout from "@/modules/checkout/market"
import Customer from "@/modules/customer"
import OrderDetail from "@/modules/orders/OrderDetail"
import BarcodeResult from "@/modules/products/barcodeResult.market"

import BarcodeListener from "@/components/barcodeListener"
import Header from "@/components/header"

const Market = () => {
  return (
    <BarcodeListener>
      <Header />
      <section className="flex flex-auto items-stretch overflow-hidden px-5">
        <div className="relative flex h-full w-2/3 flex-col overflow-hidden py-4 pr-4">
          <Cart />
          <BarcodeResult />
        </div>
        <div className="flex w-1/3 flex-col border-l p-4 pr-0">
          <OrderDetail>
            <Customer />
            <Checkout />
          </OrderDetail>
        </div>
      </section>
    </BarcodeListener>
  )
}

export default Market
