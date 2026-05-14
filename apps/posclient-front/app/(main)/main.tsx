import CheckoutMain from "@/modules/checkout/main"
import ProductsContainer from "@/modules/products/productsContainer"

import BarcodeListener from "@/components/barcodeListener"
import Header from "@/components/header/header.main"

import CheckoutDialog from "./(orders)/components/CheckoutDialog"

const MainIndexPage = () => {
  return (
    <BarcodeListener>
      <Header />
      <section className="flex overflow-hidden flex-auto items-stretch">
        <div className="flex flex-col p-4 pr-0 w-2/3 h-full">
          <ProductsContainer />
        </div>
        <div className="flex flex-col w-1/3 border-l">
          <CheckoutMain />
        </div>
      </section>
      <CheckoutDialog />
    </BarcodeListener>
  )
}

export default MainIndexPage