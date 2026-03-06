import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { cartAtom } from "@/store/cart.store"
import { activeOrderIdAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"

import useKeyEvent from "@/lib/useKeyEvent"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const OrderCUButton = ({ variant }: { variant?: "outline" }) => {
  const cart = useAtomValue(cartAtom)
  const setActive = useSetAtom(activeOrderIdAtom)
  const { orderCU, loading } = useOrderCU((id) => setActive(id))
  const disabled = cart.length === 0 || loading
  useKeyEvent(() => !disabled && orderCU(), "F12")

  return (
    <Button
      className={cn(
        "w-full",
        !variant && " bg-green-500 hover:bg-green-500/90"
      )}
      size="lg"
      disabled={cart.length === 0}
      loading={loading}
      onClick={() => orderCU()}
      variant={variant}
    >
      Төлбөр шалгах F12
    </Button>
  )
}

export default OrderCUButton
