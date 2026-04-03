import useSplitOrder from "@/modules/orders/hooks/useOrdeSplit"

import { Button } from "@/components/ui/button"
import { LoaderIcon } from "@/components/ui/loader"

const SplitOrder = () => {
  const { disabled, loading, splitOrder } = useSplitOrder()
  return (
    <Button
      className="bg-amber-500 hover:bg-amber-600 whitespace-nowrap font-bold px-3 mr-2"
      disabled={disabled || loading}
      onClick={splitOrder}
    >
      {loading && <LoaderIcon />}
      Захиалга салгах
    </Button>
  )
}

export default SplitOrder
