// import EventListener from "@/modules/kiosk/EventListener"

import BuyAction from "@/modules/checkout/components/buyAction/buyAction.kiosk"
import Cart from "@/modules/checkout/components/cart/cart.kiosk"
import ProductCategories from "@/modules/products/productCategories.kiosk"
import Products from "@/modules/products/products.kiosk"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import Header from "@/components/header/header.kiosk"

const Kiosk = () => {
  return (
    <div className="max-w-full flex flex-col h-screen">
      <Header />
      <div className="grid grid-cols-4 flex-auto pt-4 overflow-hidden">
        <ProductCategories />
        <Products />
      </div>
      <div className="w-full grid grid-cols-4 bg-neutral-100 py-3">
        <AspectRatio ratio={1.2}>
          <div className="border-r px-4 py-3 h-full">
            <h2 className="font-bold text-lg leading-5">Миний захиалга</h2>
          </div>
        </AspectRatio>
        <Cart />
        <BuyAction />
      </div>
      {/* <EventListener /> */}
    </div>
  )
}

export default Kiosk
