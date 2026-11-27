"use client"

import { PreviewBonusItems } from "@/modules/customer/components/PreviewBonusItems"
import { cartAtom } from "@/store/cart.store"
import { AnimatePresence } from "framer-motion"
import { useAtomValue } from "jotai"
import { ShoppingBagIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

import CartItem, { CART_ROW_GRID } from "../cartItem/cartItem.main"

const Cart = () => {
  const cart = useAtomValue(cartAtom)
  const isEmpty = !cart.length

  if (isEmpty) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-foreground shadow-sm">
          <ShoppingBagIcon className="size-6" aria-hidden="true" />
        </span>
        <p className="text-base font-medium tracking-tight">Сагс хоосон</p>
        <p className="max-w-60 text-balance text-[13px] text-muted-foreground">
          Бараа дээр дарж захиалгад нэмнэ үү.
        </p>
      </div>
    )
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          CART_ROW_GRID,
          "shrink-0 border-b px-3 py-1.5 text-xs font-medium text-muted-foreground"
        )}
      >
        <span className="col-span-2">Бараа</span>
        <span className="w-[5.25rem] text-center">Тоо</span>
        <span className="text-right">Дүн</span>
        <span className="w-6" />
      </div>
      <ScrollArea className="flex min-h-0 flex-1 flex-col">
        <div className="divide-y border-b">
          <AnimatePresence>
            {cart.map((item, idx) => (
              <CartItem key={item._id} {...item} idx={idx} />
            ))}
          </AnimatePresence>
        </div>
        <PreviewBonusItems />
      </ScrollArea>
    </div>
  )
}

export default Cart
