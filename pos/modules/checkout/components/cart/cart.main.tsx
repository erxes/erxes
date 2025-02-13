"use client"
import { cartAtom } from "@/store/cart.store"
import { AnimatePresence } from "framer-motion"
import { useAtomValue } from "jotai"
import { ScrollArea } from "@/components/ui/scroll-area"

import CartItem from "../cartItem/cartItem.main"

const Cart = () => {
  const cart = useAtomValue(cartAtom)
  const isEmpty = !cart.length


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
      {cart.map((item, idx) => (
        <CartItem
          key={item._id}
          {...item}
          idx={idx}
        />
      ))}
      </AnimatePresence>
    </ScrollArea>
  )
}

export default Cart
