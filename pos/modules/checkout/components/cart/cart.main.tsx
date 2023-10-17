"use client"

import { cartAtom } from "@/store/cart.store"
import { AnimatePresence } from "framer-motion"
import { useAtomValue } from "jotai"

import { ScrollArea } from "@/components/ui/scroll-area"

import CartItem from "../cartItem/cartItem.main"

const Cart = () => {
  const cart = useAtomValue(cartAtom)
  return (
    <ScrollArea className="flex flex-auto flex-col border-t">
      <AnimatePresence>
        {cart.map((item, idx) => (
          <CartItem key={item._id} {...item} idx={idx} />
        ))}
      </AnimatePresence>
    </ScrollArea>
  )
}

export default Cart
