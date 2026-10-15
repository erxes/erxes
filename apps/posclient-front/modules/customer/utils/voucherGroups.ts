import { CustomerLoyaltyVoucher } from "@/types/customer.types"
import { formatNum } from "@/lib/utils"

export interface VoucherGroup {
  key: string
  title: string
  valueText: string
  expiresAt?: string | null
  count: number
  // The one picking this group uses: the chosen one, else the first usable.
  voucherId: string
  selected: boolean
  autoApplied: boolean
  applicable: boolean
  reason?: string | null
}

export const voucherValueText = ({
  kind,
  value,
}: Pick<CustomerLoyaltyVoucher, "kind" | "value">) => {
  if (!value) return ""
  return kind === "percent" ? `${value}%` : `${formatNum(value)}₮`
}

const dayOf = (value?: string | null) => (value ? value.slice(0, 10) : "")

// Vouchers that give the same thing until the same day are one line; which
// of them is used makes no difference.
export const groupVouchers = (
  vouchers: CustomerLoyaltyVoucher[],
  chosenId?: string | null
): VoucherGroup[] => {
  const groups = new Map<string, VoucherGroup>()

  for (const voucher of vouchers) {
    const usable = voucher.applicable || voucher._id === chosenId
    const key = [
      voucher.title,
      voucher.voucherType,
      voucher.kind,
      voucher.value,
      dayOf(voucher.expiresAt),
      usable ? "" : voucher.reason,
    ].join("|")
    const group = groups.get(key)

    if (!group) {
      groups.set(key, {
        key,
        title: voucher.title,
        valueText: voucherValueText(voucher),
        expiresAt: voucher.expiresAt,
        count: 1,
        voucherId: voucher._id,
        selected: voucher._id === chosenId,
        autoApplied: voucher.autoApplied,
        applicable: usable,
        reason: usable ? null : voucher.reason,
      })
      continue
    }

    group.count += 1

    if (voucher._id === chosenId) {
      group.voucherId = voucher._id
      group.selected = true
    }
  }

  return Array.from(groups.values())
}
