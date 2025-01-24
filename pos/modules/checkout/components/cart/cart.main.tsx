"use client"

import { cartAtom } from "@/store/cart.store"
import { AnimatePresence } from "framer-motion"
import { useAtomValue } from "jotai"
import { combineCartItems } from "../../utils/cart"
import { ScrollArea } from "@/components/ui/scroll-area"

import CartItem from "../cartItem/cartItem.main"

const Cart = () => {
  const cart = useAtomValue(cartAtom)
  const combinedItems = combineCartItems(cart);
  return (
    <ScrollArea className="flex flex-auto flex-col border-t">
      <AnimatePresence>
      {combinedItems.map((item, idx) => (
        <CartItem
          key={item._id}
          {...item}
          idx={idx}
          combinedCount={item.count}
        />
      ))}
      </AnimatePresence>
    </ScrollArea>
  )
}

export default Cart
