import { currentPaymentTypeAtom } from "@/store"
import { useMutation } from "@apollo/client"
import { useSetAtom } from "jotai"

import { getMode } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useAddPayment = (options?: { onError?: (errors: any) => void }) => {
  const mode = getMode()
  const setType = useSetAtom(currentPaymentTypeAtom)
  const { onError } = options || {}
  const { onError: error } = useToast()

  const [addPayment, { loading }] = useMutation(mutations.ordersAddPayment, {
    onCompleted() {
      mode === "main" && setType("")
    },
    refetchQueries: ["orderDetail"],
    onError: (e) => {
      error(e)
      onError && onError(e)
    },
  })
  return { addPayment, loading }
}

export default useAddPayment
