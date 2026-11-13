import { useEffect, useState } from "react"
import { cartAtom } from "@/store/cart.store"
import {
  activeOrderIdAtom,
  customerAtom,
  customerTypeAtom,
  pricingBoundaryAtom,
} from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { nextBoundary, PricingScheduleStatus } from "@/lib/pricingReason"

import { queries } from "../graphql"

const POLL_MS = 60 * 1000
const TICK_MS = 30 * 1000

// Scheduled pricing plans for the cart's products, refreshed every minute and
// right after the soonest window opens or closes.
export const usePricingSchedule = () => {
  const cart = useAtomValue(cartAtom)
  const customer = useAtomValue(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)
  const orderId = useAtomValue(activeOrderIdAtom)
  const [now, setNow] = useState(() => new Date())
  const bumpBoundary = useSetAtom(pricingBoundaryAtom)

  const productIds = Array.from(
    new Set(cart.map(({ productId }) => productId))
  ).sort()

  const { data, refetch } = useQuery<{
    poscPricingSchedule?: PricingScheduleStatus[]
  }>(queries.poscPricingSchedule, {
    variables: {
      productIds,
      customerId: !customerType ? customer?._id : undefined,
      orderId: orderId || undefined,
    },
    skip: !productIds.length,
    pollInterval: POLL_MS,
    fetchPolicy: "cache-and-network",
  })

  const statuses = productIds.length ? data?.poscPricingSchedule || [] : []
  const boundary = nextBoundary(statuses)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!boundary) return

    const wait = boundary - Date.now() + 1000
    if (wait <= 0 || wait > 24 * 60 * 60 * 1000) return

    const id = setTimeout(() => {
      setNow(new Date())
      refetch()
      bumpBoundary((count) => count + 1)
    }, wait)

    return () => clearTimeout(id)
  }, [boundary, refetch, bumpBoundary])

  return { statuses, now, hasOrder: !!orderId }
}
