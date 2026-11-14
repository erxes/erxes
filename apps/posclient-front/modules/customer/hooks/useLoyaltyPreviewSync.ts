import { useEffect, useState } from "react"
import { cartAtom } from "@/store/cart.store"
import {
  activeOrderIdAtom,
  couponCodeAtom,
  customerAtom,
  customerTypeAtom,
  loyaltyPreviewAtom,
  loyaltyPreviewBonusesAtom,
  pricingBoundaryAtom,
  voucherIdAtom,
} from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { OrderItem } from "@/types/order.types"
import type { PricingReason } from "@/lib/pricingReason"

import { queries } from "../graphql"

interface PreviewResponse {
  poscLoyaltyPreview?: {
    lines: {
      key: string
      percent: number
      unitPrice: number
      title?: string | null
      reasons?: PricingReason[] | null
    }[]
    bonuses: { productId: string; name: string; count: number }[]
  } | null
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
  const orderId = useAtomValue(activeOrderIdAtom)
  const setPreview = useSetAtom(loyaltyPreviewAtom)
  const setPreviewBonuses = useSetAtom(loyaltyPreviewBonusesAtom)
  const boundary = useAtomValue(pricingBoundaryAtom)

  // Free lines go too: a bonus the saved order already holds merges into its
  // line instead of being previewed as a new one.
  const items = cart
    .filter((item) => !hasAutoDiscount(item))
    .map(({ _id, productId, count, unitPrice, conditionCode }) => ({
      key: _id,
      productId,
      count,
      unitPrice,
      conditionCode: conditionCode || undefined,
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

  const { data, refetch } = useQuery<PreviewResponse>(
    queries.poscLoyaltyPreview,
    {
      variables: {
        items: JSON.parse(settledKey),
        customerId,
        couponCode,
        voucherId,
        orderId: orderId || undefined,
      },
      skip,
      fetchPolicy: "cache-and-network",
    }
  )

  // A scheduled window just opened or closed: the same cart may price differently.
  useEffect(() => {
    if (boundary && !skip) refetch()
  }, [boundary, skip, refetch])

  useEffect(() => {
    const preview = skip ? null : data?.poscLoyaltyPreview
    setPreview(
      Object.fromEntries(
        (preview?.lines || []).map(
          ({ key, percent, unitPrice, title, reasons }) => [
            key,
            {
              percent,
              unitPrice,
              title: title || undefined,
              reasons: reasons || undefined,
            },
          ]
        )
      )
    )
    setPreviewBonuses(preview?.bonuses || [])
  }, [data, skip, setPreview, setPreviewBonuses])
}
