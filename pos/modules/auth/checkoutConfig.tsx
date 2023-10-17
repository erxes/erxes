import { allowTypesAtom, kitchenScreenAtom } from "@/store/config.store"
import { orderTypeAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"

import Loader from "@/components/ui/loader"

import queries from "./graphql/queries"

const CheckoutConfig = ({ children }: { children: React.ReactNode }) => {
  const [allowTypes, setAllowTypes] = useAtom(allowTypesAtom)
  const setType = useSetAtom(orderTypeAtom)
  const setKitchenScreen = useSetAtom(kitchenScreenAtom)

  const { loading } = useQuery(queries.getCheckoutConfig, {
    onCompleted(data) {
      const { allowTypes, kitchenScreen } = data?.currentConfig || {}
      setAllowTypes(allowTypes)
      if (allowTypes.length > 0) {
        setType(allowTypes[0])
      }
      setKitchenScreen(kitchenScreen)
    },
    skip: !!allowTypes,
  })

  if (loading) return <Loader />

  return <>{children}</>
}

export default CheckoutConfig
