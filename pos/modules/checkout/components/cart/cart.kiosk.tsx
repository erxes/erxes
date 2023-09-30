"use client"
import { cartAtom } from "@/store/cart.store"
import { useAtomValue } from "jotai"

import CartItem from "../cartItem/cartItem.kiosk"

const CartKiosk = () => {
  const cart = useAtomValue(cartAtom)
  return (
    <div className=" flex items-center h-full w-auto gap-2 col-span-3 mx-4 overflow-x-auto">
      {cart.map((item) => (
        <CartItem key={item._id} {...item} />
      ))}
    </div>
  )
}

export default CartKiosk
