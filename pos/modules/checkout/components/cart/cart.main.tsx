"use client"

import { cartAtom } from "@/store/cart.store"
import { AnimatePresence } from "framer-motion"
import { useAtom } from "jotai"

import { ScrollArea } from "@/components/ui/scroll-area"

import CartItem from "../cartItem/cartItem.main"

const Cart = () => {
  const [cart] = useAtom(cartAtom)
  return (
    <ScrollArea className="flex flex-auto flex-col border-t">
      <AnimatePresence>
        {cart.map((item) => (
          <CartItem key={item._id} {...item} />
        ))}
      </AnimatePresence>
    </ScrollArea>
  )
}

export default Cart
