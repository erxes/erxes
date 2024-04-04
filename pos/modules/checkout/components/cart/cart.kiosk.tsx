"use client"

import { cartAtom } from "@/store/cart.store"
import { useAtomValue } from "jotai"

import { ScrollAreaXWithButton } from "@/components/ui/scroll-area"

import CartItem from "../cartItem/cartItem.kiosk"

const CartKiosk = () => {
  const cart = useAtomValue(cartAtom)
  return (
    <ScrollAreaXWithButton
      className="h-full gap-2 col-span-3 ml-4"
      type="always"
    >
      <div className="flex gap-2 width-auto overflow-visible h-full items-center py-4 pr-2">
        {cart.map((item) => (
          <CartItem key={item._id} {...item} />
        ))}
      </div>
    </ScrollAreaXWithButton>
  )
}

export default CartKiosk
