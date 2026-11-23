import useSplitOrder from "@/modules/orders/hooks/useOrdeSplit"

import { Button } from "@/components/ui/button"
import { LoaderIcon } from "@/components/ui/loader"

const SplitOrder = () => {
  const { disabled, loading, splitOrder } = useSplitOrder()
  return (
    <Button
      variant="outline"
      className="h-11 whitespace-nowrap rounded-xl px-4 font-semibold"
      disabled={disabled || loading}
      onClick={splitOrder}
    >
      {loading && <LoaderIcon />}
      Захиалга салгах
    </Button>
  )
}

export default SplitOrder
