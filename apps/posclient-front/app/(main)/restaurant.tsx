import CheckoutMain from "@/modules/checkout/main"
import ProductsContainer from "@/modules/products/productsContainer"
import Slots from "@/modules/slots"
import SelectTab from "@/modules/slots/components/SelectTab"
import { selectedTabAtom } from "@/store"
import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"
import Header from "@/components/header/header.main"

import CheckoutDialog from "./(orders)/components/CheckoutDialog"

const Restaurant = () => {
  const selectedTab = useAtomValue(selectedTabAtom)
  return (
    <>
      <Header />
      <section className="flex overflow-hidden flex-auto items-stretch">
        <div className={cn("flex relative flex-col p-3 pl-4 w-2/3 h-full")}>
          <Slots />
          {selectedTab === "products" && <ProductsContainer />}
          <SelectTab />
        </div>
        <div className={"flex flex-col w-1/3 border-l"}>
          <CheckoutMain />
        </div>
      </section>
      <CheckoutDialog />
    </>
  )
}

export default Restaurant
