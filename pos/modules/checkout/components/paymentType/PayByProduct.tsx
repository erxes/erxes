import { cartAtom } from "@/store/cart.store"
import { useAtomValue } from "jotai"

import { ScrollArea } from "@/components/ui/scroll-area"

import OrderItem from "./orderItem"

const PayByProduct = () => {
  const items = useAtomValue(cartAtom)

  return (
    <ScrollArea className="h-[25rem]">
      {(items || []).map((item) => (
        <OrderItem {...item} key={item._id} />
      ))}                                               
    </ScrollArea>
  )
}

export default PayByProduct
