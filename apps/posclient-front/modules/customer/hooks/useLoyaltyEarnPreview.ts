import { useEffect, useState } from "react"
import { cartAtom } from "@/store/cart.store"
import {
  customerAtom,
  customerTypeAtom,
  loyaltyPreviewAtom,
  orderTypeAtom,
} from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { fixNum } from "@/lib/utils"

import { queries } from "../graphql"

export interface LoyaltyEarn {
  walletName?: string | null
  points: number
  reasons: string[]
  error?: string | null
}

interface EarnPreviewResponse {
  poscLoyaltyEarnPreview?: { hasRules: boolean; earns: LoyaltyEarn[] } | null
}

const CART_DEBOUNCE_MS = 500

// Points paying this cart would give the chosen customer, counted on the
// prices the cart will actually be paid at.
export const useLoyaltyEarnPreview = () => {
  const cart = useAtomValue(cartAtom)
  const preview = useAtomValue(loyaltyPreviewAtom)
  const customer = useAtomValue(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)
  const orderType = useAtomValue(orderTypeAtom)

  const items = cart.map(({ _id, productId, count, unitPrice }) => ({
    productId,
    amount: fixNum((preview[_id]?.unitPrice ?? unitPrice) * count),
  }))
  const itemsKey = JSON.stringify(items)
  const [settledKey, setSettledKey] = useState(itemsKey)

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setSettledKey(itemsKey),
      CART_DEBOUNCE_MS
    )
    return () => clearTimeout(timeoutId)
  }, [itemsKey])

  const settledItems: { productId: string; amount: number }[] =
    JSON.parse(settledKey)
  const isCustomer = !!customer?._id && !customerType
  const skip = !isCustomer || !settledItems.length

  const { data, error } = useQuery<EarnPreviewResponse>(
    queries.poscLoyaltyEarnPreview,
    {
      variables: {
        items: settledItems,
        totalAmount: settledItems.reduce((sum, { amount }) => sum + amount, 0),
        customerId: customer?._id,
        orderType,
      },
      skip,
      fetchPolicy: "cache-and-network",
    }
  )

  const result = skip ? null : data?.poscLoyaltyEarnPreview ?? null

  return { result, error: skip ? undefined : error }
}
