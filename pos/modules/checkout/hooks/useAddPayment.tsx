import { queries } from "@/modules/orders/graphql"
import { useMutation } from "@apollo/client"

import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useAddPayment = (options?: { onError?: (errors: any) => void }) => {
  const { onError } = options || {}
  const { onError: error } = useToast()
  const [addPayment, { loading }] = useMutation(mutations.ordersAddPayment, {
    refetchQueries: ["orderDetail"],
    onError: (e) => {
      error(e)
      onError && onError(e)
    },
  })
  return { addPayment, loading }
}

export default useAddPayment
