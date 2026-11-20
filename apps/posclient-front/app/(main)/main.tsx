import CheckoutMain from "@/modules/checkout/main"
import ProductsContainer from "@/modules/products/productsContainer"

import BarcodeListener from "@/components/barcodeListener"
import Header from "@/components/header/header.main"

import CheckoutDialog from "./(orders)/components/CheckoutDialog"

const MainIndexPage = () => {
  return (
    <BarcodeListener>
      <Header />
      <section className="flex flex-auto items-stretch overflow-hidden bg-muted/60">
        <div className="flex h-full w-2/3 flex-col p-4 pr-2">
          <ProductsContainer />
        </div>
        <div className="flex w-1/3 flex-col py-3 pr-3 pl-1">
          <div className="relative flex flex-auto flex-col overflow-hidden rounded-2xl bg-background shadow-sm">
            <CheckoutMain />
          </div>
        </div>
      </section>
      <CheckoutDialog />
    </BarcodeListener>
  )
}

export default MainIndexPage