"use client"
import { useMemo } from "react"
import { cartAtom } from "@/store/cart.store"
import { AnimatePresence } from "framer-motion"
import { useAtomValue } from "jotai"
import { combineCartItems } from "../../utils/cart"
import { ScrollArea } from "@/components/ui/scroll-area"

import CartItem from "../cartItem/cartItem.main"

const Cart = () => {
  const cart = useAtomValue(cartAtom)
  const combinedItems = useMemo(() => combineCartItems(cart), [cart])
  const isEmpty = !combinedItems.length

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Your cart is empty</p>
      </div>
    )
  }
  return (
    <ScrollArea className="flex flex-auto flex-col border-t">
      <AnimatePresence>
      {combinedItems.map((item, idx) => (
        <CartItem
          key={item._id}
          {...item}
          idx={idx}
          combinedCount={item.count}
          productId={item._id}
          unitPrice={item.unitPrice || 0}
          itemIds={item.itemIds || []}
        />
      ))}
      </AnimatePresence>
    </ScrollArea>
  )
}

export default Cart
