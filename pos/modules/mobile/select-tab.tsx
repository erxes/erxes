import { activeCatName } from "@/store"
import { useAtomValue } from "jotai"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import CheckoutMain from "../checkout/main"
import Products from "../products"

const SelectTab = () => {
  const catName = useAtomValue(activeCatName)
  return (
    <Tabs defaultValue="products" className="flex-1 flex flex-col">
      <TabsList className="w-full grid grid-cols-2 mb-2">
        <TabsTrigger value="products">
          Бараа {!!catName && `(${catName})`}
        </TabsTrigger>
        <TabsTrigger value="checkout">Сагс</TabsTrigger>
      </TabsList>
      <TabsContent value="products" className="flex-auto">
        <div></div>
        <Products />
      </TabsContent>
      <TabsContent value="checkout" className="flex-auto flex flex-col">
        <CheckoutMain />
      </TabsContent>
    </Tabs>
  )
}

export default SelectTab
