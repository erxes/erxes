import { useMutation } from "@apollo/client"

import { onError } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useChangeOrderStatus = () => {
  const [changeStatus, { data, loading }] = useMutation(
    mutations.orderChangeStatus,
    {
      onError(err) {
        onError(err.message)
      },
    }
  )
  const { _id, status } = data?.orderChangeStatus || {}
  return { changeStatus, _id, status, loading }
}

export default useChangeOrderStatus
