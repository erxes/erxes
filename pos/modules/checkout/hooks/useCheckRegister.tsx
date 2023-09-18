import { queries } from "@/modules/checkout/graphql"
import { useLazyQuery } from "@apollo/client"

const useCheckRegister = () => {
  const [checkRegister, { loading, data }] = useLazyQuery(
    queries.ordersCheckCompany
  )
  const { ordersCheckCompany } = data || {}

  return { checkRegister, loading, data: ordersCheckCompany }
}

export default useCheckRegister
