import ProductsContainer from "@/modules/products/productsContainer"
import Slots from "@/modules/slots"
import SelectTab from "@/modules/slots/components/SelectTab"
import { selectedTabAtom } from "@/store"
import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"
import Header from "@/components/header/header.main"

import CheckoutDialog from "./(orders)/components/CheckoutDialog"
import { SalesWorkspace } from "./SalesWorkspace"

const Restaurant = () => {
  const selectedTab = useAtomValue(selectedTabAtom)
  return (
    <>
      <Header />
      <SalesWorkspace>
        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col",
            selectedTab === "products" ? "pb-16" : "p-3"
          )}
        >
          <Slots />
          {selectedTab === "products" && <ProductsContainer />}
          <SelectTab />
        </div>
      </SalesWorkspace>
      <CheckoutDialog />
    </>
  )
}

export default Restaurant
