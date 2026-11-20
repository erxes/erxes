"use client"
import { cartAtom } from "@/store/cart.store"
import { AnimatePresence } from "framer-motion"
import { useAtomValue } from "jotai"
import { ShoppingBagIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PreviewBonusItems } from "@/modules/customer/components/PreviewBonusItems"

import CartItem from "../cartItem/cartItem.main"

const Cart = () => {
  const cart = useAtomValue(cartAtom)
  const isEmpty = !cart.length


  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShoppingBagIcon className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Your cart is empty
        </p>
      </div>
    )
  }
  return (
    <ScrollArea className="flex flex-auto flex-col">
      <div className="space-y-1.5 px-3 py-1">
      <AnimatePresence>
      {cart.map((item, idx) => (
        <CartItem
          key={item._id}
          {...item}
          idx={idx}
        />
      ))}
      </AnimatePresence>
      </div>
      <PreviewBonusItems />
    </ScrollArea>
  )
}

export default Cart
