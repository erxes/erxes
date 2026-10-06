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
  poscLoyaltyPreview?: { productId: string; percent: number }[] | null
}

const CART_DEBOUNCE_MS = 500

// A saved line already carries its loyalty discount; previewing it again would double it.
const hasLoyaltyDiscount = (item: OrderItem) =>
  (item.discountInfos || []).some(({ type }) => type === "voucher")

// One query for the whole cart; rows read the result from loyaltyPreviewAtom.
export const useLoyaltyPreviewSync = () => {
  const cart = useAtomValue(cartAtom)
  const customer = useAtomValue(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)
  const couponCode = useAtomValue(couponCodeAtom)
  const voucherId = useAtomValue(voucherIdAtom)
  const setPreview = useSetAtom(loyaltyPreviewAtom)

  const items = cart
    .filter((item) => !hasLoyaltyDiscount(item) && item.unitPrice > 0)
    .map(({ productId, count, unitPrice }) => ({ productId, count, unitPrice }))
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
  const skip = settledKey === "[]" || (!customerId && !couponCode && !voucherId)

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
        lines.map(({ productId, percent }) => [productId, percent])
      )
    )
  }, [data, skip, setPreview])
}
