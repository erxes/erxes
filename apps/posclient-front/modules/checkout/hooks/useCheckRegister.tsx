import { queries } from "@/modules/checkout/graphql"
import { useLazyQuery } from "@apollo/client"

const useCheckRegister = () => {
  const [checkRegister, { loading, data }] = useLazyQuery(
    queries.ordersCheckCompany,
    {
      fetchPolicy: "network-only",
    }
  )
  const { ordersCheckCompany } = data || {}

  return { checkRegister, loading, data: ordersCheckCompany }
}

export default useCheckRegister
