import { allowTypesAtom } from "@/store/config.store"
import { orderTypeAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"

import Loader from "@/components/ui/loader"

import queries from "./graphql/queries"

const AllowTypes = ({ children }: { children: React.ReactNode }) => {
  const [allowTypes, setAllowTypes] = useAtom(allowTypesAtom)
  const setType = useSetAtom(orderTypeAtom)

  const { loading } = useQuery(queries.getAllowTypes, {
    onCompleted(data) {
      const { allowTypes } = data?.currentConfig || {}
      setAllowTypes(allowTypes)
      if (allowTypes.length > 0) {
        setType(allowTypes[0])
      }
    },
    skip: !!allowTypes,
  })

  if (loading) return <Loader />

  return <>{children}</>
}

export default AllowTypes
