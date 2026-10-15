import { useEffect, useRef } from "react"
import { acceptCouponsAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import { groupVouchers } from "../utils/voucherGroups"
import { useCustomerLoyalty } from "./useCustomerLoyalty"
import { useLoyaltyEarnPreview } from "./useLoyaltyEarnPreview"
import { useLoyaltySelection } from "./useLoyaltySelection"

// Everything the sidebar row and the loyalty dialog show, in one place.
export const useLoyaltySummary = () => {
  const { loyalty, loading } = useCustomerLoyalty()
  const selection = useLoyaltySelection()
  const { result: earnPreview } = useLoyaltyEarnPreview()
  const acceptCoupons = useAtomValue(acceptCouponsAtom)
  const { voucherId, loading: saving, toggleVoucher } = selection

  const vouchers = loyalty?.vouchers || []
  const wallets = loyalty?.wallets || []

  // A chosen voucher the order no longer meets would fail every later save.
  const chosen = vouchers.find(({ _id }) => _id === voucherId)
  const chosenLost = !!loyalty && !!voucherId && !chosen?.applicable

  // Once per voucher, so a failed save cannot bounce it back and forth.
  const droppedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!chosenLost || !voucherId || saving) return
    if (droppedRef.current === voucherId) return
    droppedRef.current = voucherId
    toggleVoucher(voucherId)
  }, [chosenLost, voucherId, saving, toggleVoucher])

  const groups = groupVouchers(vouchers, voucherId)
  const pickable = groups.filter(
    ({ autoApplied, applicable, selected }) =>
      !autoApplied && applicable && !selected
  )

  // The wallet this purchase earns into, else the first one held.
  const earningName = earnPreview?.earns?.[0]?.walletName
  const wallet =
    wallets.find(({ name }) => !!earningName && name === earningName) ||
    wallets[0] ||
    null

  const singlePick = !voucherId && pickable.length === 1 ? pickable[0] : null

  return {
    ...selection,
    // `loading` is the customer's loyalty; `saving` is a choice being saved.
    loading,
    saving,
    loyalty,
    wallet,
    groups,
    chosen: chosen || null,
    // Shown on the row itself when it is the only thing to pick.
    singlePick,
    morePicks: singlePick ? 0 : pickable.length,
    frozen: loyalty?.status === "frozen",
    acceptCoupons,
    // A coupon needs no customer, so the row stays for it alone.
    visible:
      !!wallets.length ||
      !!vouchers.length ||
      !!earnPreview?.hasRules ||
      acceptCoupons ||
      !!selection.couponCode,
  }
}

export type LoyaltySummary = ReturnType<typeof useLoyaltySummary>
