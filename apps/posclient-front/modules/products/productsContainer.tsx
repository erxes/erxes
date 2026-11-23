import { activeCategoryAtom, activeCatName, modeAtom } from "@/store"
import { useAtomValue } from "jotai"
import { PackageIcon } from "lucide-react"

import Products from "."
import Slots from "../slots/slots.main"
import BarcodeResult from "./barcodeResult.market"
import Search from "./components/search/search.main"
import ToggleRemainder from "./components/ToggleRemainder"
import InitialCategories from "./InitialCategories"
import ProductCategories from "./productCategories.main"

const ProductsContainer = () => {
  const mode = useAtomValue(modeAtom)
  const activeCategory = useAtomValue(activeCategoryAtom)
  const categoryName = useAtomValue(activeCatName)
  return (
    <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
      {mode !== "restaurant" && <Slots />}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-10 shrink-0 items-center justify-between gap-3 bg-background px-3">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1 text-[13px]"
          >
            <span className="flex h-7 flex-none items-center gap-2 px-1 font-medium">
              <PackageIcon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Бараа
            </span>
            {!!activeCategory && !!categoryName && (
              <>
                <span
                  className="h-3 w-0.5 flex-none rounded-lg bg-border"
                  aria-hidden="true"
                />
                <span className="truncate px-1 font-medium text-muted-foreground">
                  {categoryName}
                </span>
              </>
            )}
          </nav>
          <Search />
        </header>
        <div className="flex min-w-0 flex-none items-center gap-1 overflow-x-auto border-y bg-background px-3 py-1">
          <ProductCategories />
          <InitialCategories />
          <ToggleRemainder />
        </div>
        <div className="relative flex min-h-0 flex-1 overflow-hidden bg-background px-3 pt-3">
          <Products />
          <BarcodeResult />
        </div>
      </div>
    </div>
  )
}

export default ProductsContainer
