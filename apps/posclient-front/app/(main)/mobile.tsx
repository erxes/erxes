import SelectTab from "@/modules/mobile/select-tab"
import Search from "@/modules/products/components/search/search-mobile"
import ProductCategories from "@/modules/products/productCategories.main"

import Header from "@/components/header/header.mobile"

const MobileIndexPage = () => {
  return (
    <div className="p-3 flex flex-col h-screen">
      <Header />
      <div className="flex items-center gap-2 my-4">
        <Search />
        <ProductCategories />
      </div>
      <SelectTab />
    </div>
  )
}

export default MobileIndexPage
