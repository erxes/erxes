import { configAtom, currentUserAtom } from "@/store/config.store"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { Customer } from "@/types/customer.types"

import queries from "../graphql/queries"

const useUser = () => {
  const user = useAtomValue(currentUserAtom)
  const config = useAtomValue(configAtom)
  const isAdmin = config?.adminIds?.includes(user?._id || "")

  return { isAdmin, userId: user?._id }
}

export const useUsers = (options?: {
  onCompleted: (data: Customer) => void
}) => {
  const { onCompleted } = options || {}
  const { loading, data } = useQuery(queries.posUsers, {
    onCompleted(data) {
      !!onCompleted && onCompleted(data.posUsers)
    },
  })

  const { posUsers } = data || {}

  return { loading, users: (posUsers as Customer[]) || [] }
}

export default useUser
