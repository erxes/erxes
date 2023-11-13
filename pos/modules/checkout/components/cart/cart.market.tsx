import { cartAtom } from "@/store/cart.store"
import { useAtom } from "jotai"

import { ScrollArea } from "@/components/ui/scroll-area"

import CartItem from "../cartItem/cartItem.market"

const Cart = () => {
  const [cart] = useAtom(cartAtom)
  return (
    <>
      <div className="mb-1 flex rounded border-transparent bg-primary px-4 py-3 text-sm leading-4 text-white">
        <small className="w-1/12">#</small>
        <small className="w-4/12">Барааны нэр</small>
        <small className="w-3/12">Тоо ширхэг</small>
        <small className="flex w-4/12">
          <span className="w-6/12">Бар код</span>
          <span className="w-5/12">Үнэ</span>
        </small>
      </div>
      <ScrollArea>
        {cart.map((item, idx) => (
          <CartItem key={item.productId} {...item} index={idx} />
        ))}
      </ScrollArea>
    </>
  )
}

export default Cart
