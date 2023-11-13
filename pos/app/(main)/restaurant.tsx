import CheckoutMain from "@/modules/checkout/main"
import ProductsContainer from "@/modules/products/productsContainer"
import Slots from "@/modules/slots"
import SelectTab from "@/modules/slots/components/SelectTab"
import { selectedTabAtom } from "@/store"
import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"
import Header from "@/components/header/header.main"

const Restaurant = () => {
  const selectedTab = useAtomValue(selectedTabAtom)
  return (
    <>
      <Header />
      <section className="flex flex-auto items-stretch overflow-hidden">
        <div className={cn("flex h-full w-2/3 flex-col p-3 pl-4 relative")}>
          {selectedTab === "plan" && <Slots />}
          {selectedTab === "products" && <ProductsContainer />}
          <SelectTab />
        </div>
        <div className={"flex w-1/3 flex-col border-l"}>
          <CheckoutMain />
        </div>
      </section>
    </>
  )
}

export default Restaurant
