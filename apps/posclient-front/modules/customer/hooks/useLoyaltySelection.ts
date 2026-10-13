import { useState } from "react"
import { totalAmountAtom } from "@/store/cart.store"
import {
  activeOrderIdAtom,
  couponCodeAtom,
  customerAtom,
  voucherChoiceAtom,
  voucherIdAtom,
} from "@/store/order.store"
import { useApolloClient } from "@apollo/client"
import { useAtom, useAtomValue } from "jotai"

import { toast } from "@/components/ui/use-toast"

import useOrderCU from "../../orders/hooks/useOrderCU"
import { queries } from "../graphql"

// The order recomputes its discounts on save, so a choice is saved right away.
// A choice the server rejects is taken back; useOrderCU already shows why.
export const useLoyaltySelection = () => {
  const client = useApolloClient()
  const orderId = useAtomValue(activeOrderIdAtom)
  const customer = useAtomValue(customerAtom)
  const totalAmount = useAtomValue(totalAmountAtom)
  const voucherId = useAtomValue(voucherIdAtom)
  const [voucherChoice, setVoucherChoice] = useAtom(voucherChoiceAtom)
  const [couponCode, setCouponCode] = useAtom(couponCodeAtom)
  const [checking, setChecking] = useState(false)
  const { orderCU, loading } = useOrderCU()

  // Atoms reach useOrderCU's variables on the next render.
  const save = (revert: () => void) => {
    if (!orderId) return
    setTimeout(async () => {
      const result = await orderCU()
      if (!result?.data) revert()
    }, 100)
  }

  const toggleVoucher = (id: string) => {
    const previous = voucherChoice
    setVoucherChoice(
      voucherId === id || !customer?._id
        ? null
        : { customerId: customer._id, voucherId: id }
    )
    save(() => setVoucherChoice(previous))
  }

  // Returns the campaign title, or null when the code was refused.
  const applyCoupon = async (rawCode: string) => {
    const code = rawCode.trim()
    if (!code) return null

    setChecking(true)
    try {
      const { data } = await client.query<{ poscCouponCheck: string }>({
        query: queries.poscCouponCheck,
        variables: { code, customerId: customer?._id, totalAmount },
        fetchPolicy: "network-only",
      })
      const previous = couponCode
      setCouponCode(code)
      save(() => setCouponCode(previous))
      return data.poscCouponCheck
    } catch (e) {
      toast({
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      })
      return null
    } finally {
      setChecking(false)
    }
  }

  const clearCoupon = () => {
    const previous = couponCode
    setCouponCode(null)
    save(() => setCouponCode(previous))
  }

  return {
    voucherId,
    couponCode,
    loading: loading || checking,
    toggleVoucher,
    applyCoupon,
    clearCoupon,
  }
}
