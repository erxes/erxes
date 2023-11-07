import Products from "."
import BarcodeResult from "./barcodeResult.market"
import Search from "./components/search/search.main"
import ProductCategories from "./productCategories.main"

const ProductsContainer = () => {
  return (
    <>
      <div className="-mt-1 flex flex-none items-center pb-3 pr-3">
        <Search />
        <div className="flex flex-auto overflow-hidden">
          <ProductCategories />
        </div>
      </div>
      <div className="flex flex-auto overflow-hidden relative">
        <Products />
        <BarcodeResult />
      </div>
    </>
  )
}

export default ProductsContainer
