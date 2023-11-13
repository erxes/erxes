import CheckoutMain from "@/modules/checkout/main"
import ProductsContainer from "@/modules/products/productsContainer"

import { cn } from "@/lib/utils"
import BarcodeListener from "@/components/barcodeListener"
import Header from "@/components/header/header.main"

const MainIndexPage = () => {
  return (
    <BarcodeListener>
      <Header />
      <section className="flex flex-auto items-stretch overflow-hidden">
        <div className={cn("flex h-full w-2/3 flex-col p-4 pr-0")}>
          <ProductsContainer />
        </div>
        <div className={"flex w-1/3 flex-col border-l"}>
          <CheckoutMain />
        </div>
      </section>
    </BarcodeListener>
  )
}

export default MainIndexPage
