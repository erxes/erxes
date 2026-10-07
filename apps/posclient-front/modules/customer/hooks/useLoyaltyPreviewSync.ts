import { useEffect, useState } from "react"
import { cartAtom } from "@/store/cart.store"
import {
  couponCodeAtom,
  customerAtom,
  customerTypeAtom,
  loyaltyPreviewAtom,
  voucherIdAtom,
} from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { OrderItem } from "@/types/order.types"

import { queries } from "../graphql"

interface PreviewResponse {
  poscLoyaltyPreview?:
    | { key: string; percent: number; unitPrice: number }[]
    | null
}

const CART_DEBOUNCE_MS = 500

// A saved line already carries its pricing and loyalty discount; previewing it again would double it.
const hasAutoDiscount = (item: OrderItem) =>
  (item.discountInfos || []).some(({ type }) => type !== "hand")

// One query for the whole cart, keyed by line; rows read it from loyaltyPreviewAtom.
export const useLoyaltyPreviewSync = () => {
  const cart = useAtomValue(cartAtom)
  const customer = useAtomValue(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)
  const couponCode = useAtomValue(couponCodeAtom)
  const voucherId = useAtomValue(voucherIdAtom)
  const setPreview = useSetAtom(loyaltyPreviewAtom)

  const items = cart
    .filter((item) => !hasAutoDiscount(item) && item.unitPrice > 0)
    .map(({ _id, productId, count, unitPrice, conditionId }) => ({
      key: _id,
      productId,
      count,
      unitPrice,
      conditionId: conditionId || undefined,
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

  const customerId = !customerType ? customer?._id : undefined
  // Pricing plans apply to anyone, so a cart is previewed even without a customer.
  const skip = settledKey === "[]"

  const { data } = useQuery<PreviewResponse>(queries.poscLoyaltyPreview, {
    variables: {
      items: JSON.parse(settledKey),
      customerId,
      couponCode,
      voucherId,
    },
    skip,
    fetchPolicy: "cache-and-network",
  })

  useEffect(() => {
    const lines = skip ? [] : data?.poscLoyaltyPreview || []
    setPreview(
      Object.fromEntries(
        lines.map(({ key, percent, unitPrice }) => [
          key,
          { percent, unitPrice },
        ])
      )
    )
  }, [data, skip, setPreview])
}
