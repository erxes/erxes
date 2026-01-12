import { activeCatName, mobileTabAtom } from "@/store"
import { cartAtom } from "@/store/cart.store"
import { useAtom, useAtomValue } from "jotai"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import CheckoutMain from "../checkout/main"
import Products from "../products"

const SelectTab = () => {
  const [tab, setTab] = useAtom(mobileTabAtom)
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as "products" | "checkout")}
      className="flex-auto flex flex-col overflow-hidden"
    >
      <TabsList className="w-full grid grid-cols-2 mb-2">
        <TabsTrigger value="products">
          Бараа <CategoryName />
        </TabsTrigger>
        <TabsTrigger value="checkout" className="py-[3px]">
          Сагс <TotalProducts />
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="products"
        className="flex-auto flex flex-col overflow-hidden data-[state=inactive]:hidden"
      >
        <ScrollArea className="flex flex-auto flex-col">
          <Products />
        </ScrollArea>
      </TabsContent>
      <TabsContent
        value="checkout"
        className="flex-auto flex flex-col overflow-hidden data-[state=inactive]:hidden"
      >
        <CheckoutMain />
      </TabsContent>
    </Tabs>
  )
}

const TotalProducts = () => {
  const cart = useAtomValue(cartAtom)
  const itemCount = cart.reduce((prev, current) => prev + current.count, 0)
  return <Badge className="ml-2 px-2">{itemCount.toFixed(1)}</Badge>
}

const CategoryName = () => {
  const catName = useAtomValue(activeCatName)

  return <>{catName ? `- ${catName}` : ""}</>
}

export default SelectTab
