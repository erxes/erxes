import { activeOrderAtom, setInitialAtom } from "@/store/order.store"
import { useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { Button } from "@/components/ui/button"

import mutations from "../../graphql/mutations"

const OrderCancel = () => {
  const id = useAtomValue(activeOrderAtom)
  const setInitialState = useSetAtom(setInitialAtom)

  const reset = () => setInitialState()

  const [cancel, { loading }] = useMutation(mutations.ordersCancel, {
    onCompleted() {
      reset()
    },
  })

  const handleCancel = () => {
    if (!id) return reset()
    return cancel({ variables: { id } })
  }

  return (
    <Button
      className="h-8 p-0 font-bold rounded-full"
      variant="outline"
      loading={loading}
      onClick={handleCancel}
    >
      Цуцлах
    </Button>
  )
}

export default OrderCancel
