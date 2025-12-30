import { currentPaymentTypeAtom, modeAtom, refetchOrderAtom } from "@/store"
import { useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { onError as error } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const resetModes = ["main", "restaurant", "mobile", "coffee-shop"]
const useAddPayment = (options?: { onError?: (errors: any) => void }) => {
  const mode = useAtomValue(modeAtom)
  const setType = useSetAtom(currentPaymentTypeAtom)
  const setRefetchOrder = useSetAtom(refetchOrderAtom)
  const { onError } = options || {}

  const [addPayment, { loading }] = useMutation(mutations.ordersAddPayment, {
    onCompleted() {
      resetModes.includes(mode) && setType("")
      setRefetchOrder(true)
    },
    refetchQueries: ["orderDetail"],
    onError: (e) => {
      error(e?.message)
      onError && onError(e)
    },
  })
  return { addPayment, loading }
}

export default useAddPayment
