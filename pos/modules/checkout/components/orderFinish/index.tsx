import { orderValuesAtom, setInitialAtom } from "@/store/order.store"
import { useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { Customer } from "@/types/customer.types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../../graphql"

const OrderFinish = () => {
  const setInitial = useSetAtom(setInitialAtom)
  const { onError } = useToast()
  const { customer, ...orderData } = useAtomValue(orderValuesAtom)

  const [finishOrder, { loading }] = useMutation(mutations.ordersFinish, {
    onCompleted: () => {
      setInitial()
    },
    onError,
  })

  return (
    <Button
      size="lg"
      className="flex-auto bg-green-500 hover:bg-green-500/90"
      loading={loading}
      onClick={() =>
        finishOrder({
          variables: { ...orderData, customerId: (customer as Customer)?._id },
        })
      }
    >
      Төлбөр төлөх
    </Button>
  )
}

export default OrderFinish
