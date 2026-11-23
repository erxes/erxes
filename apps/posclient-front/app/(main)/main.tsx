import ProductsContainer from "@/modules/products/productsContainer"

import BarcodeListener from "@/components/barcodeListener"
import Header from "@/components/header/header.main"

import CheckoutDialog from "./(orders)/components/CheckoutDialog"
import { SalesWorkspace } from "./SalesWorkspace"

const MainIndexPage = () => {
  return (
    <BarcodeListener>
      <Header />
      <SalesWorkspace>
        <ProductsContainer />
      </SalesWorkspace>
      <CheckoutDialog />
    </BarcodeListener>
  )
}

export default MainIndexPage
