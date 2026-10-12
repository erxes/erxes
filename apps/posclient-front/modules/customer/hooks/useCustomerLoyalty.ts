import { useEffect, useState } from "react"
import { totalAmountAtom } from "@/store/cart.store"
import { customerAtom, customerTypeAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { CustomerLoyalty } from "@/types/customer.types"

import { queries } from "../graphql"

interface CustomerLoyaltyResponse {
  poscCustomerLoyalty?: CustomerLoyalty | null
}

// Cart edits come fast; reward voucher checks only need the settled total.
const TOTAL_DEBOUNCE_MS = 500

export const useCustomerLoyalty = () => {
  const customer = useAtomValue(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)
  const totalAmount = useAtomValue(totalAmountAtom)
  const [settledTotal, setSettledTotal] = useState(totalAmount)

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setSettledTotal(totalAmount),
      TOTAL_DEBOUNCE_MS
    )
    return () => clearTimeout(timeoutId)
  }, [totalAmount])

  const isCustomer = !!customer?._id && !customerType

  const { data, loading } = useQuery<CustomerLoyaltyResponse>(
    queries.poscCustomerLoyalty,
    {
      variables: { customerId: customer?._id, totalAmount: settledTotal },
      skip: !isCustomer,
      fetchPolicy: "cache-and-network",
    }
  )

  return {
    loyalty: isCustomer ? data?.poscCustomerLoyalty ?? null : null,
    loading: isCustomer && loading && !data,
  }
}
