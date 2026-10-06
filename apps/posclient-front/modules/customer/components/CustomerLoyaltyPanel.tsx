import { useEffect, useRef } from "react"
import { format } from "date-fns"

import { CustomerLoyaltyVoucher } from "@/types/customer.types"
import { formatNum } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { useCustomerLoyalty } from "../hooks/useCustomerLoyalty"
import { useLoyaltySelection } from "../hooks/useLoyaltySelection"

const formatDate = (value?: string | null) =>
  value ? format(new Date(value), "yyyy.MM.dd") : ""

const voucherValue = ({ kind, value }: CustomerLoyaltyVoucher) => {
  if (!value) return ""
  return kind === "percent" ? `${value}%` : `${formatNum(value)}₮`
}

const VoucherRow = ({
  voucher,
  selected,
  saving,
  onToggle,
}: {
  voucher: CustomerLoyaltyVoucher
  selected: boolean
  saving: boolean
  onToggle: () => void
}) => (
  <div className="flex items-start justify-between gap-2 py-1">
    <div className="min-w-0">
      <div className="truncate font-medium">
        {voucher.title} {voucherValue(voucher)}
      </div>
      <div className="text-xs text-neutral-500">
        {voucher.expiresAt && `${formatDate(voucher.expiresAt)} хүртэл`}
        {!voucher.applicable && voucher.reason && (
          <span className="text-red-500"> · {voucher.reason}</span>
        )}
      </div>
    </div>
    {voucher.autoApplied ? (
      <Badge variant="secondary" className="shrink-0">
        Автоматаар
      </Badge>
    ) : (
      <Button
        size="sm"
        variant={selected ? "default" : "outline"}
        className="h-7 shrink-0 px-2 text-xs"
        disabled={saving || (!selected && !voucher.applicable)}
        onClick={onToggle}
      >
        {selected ? "Хэрэглэж байна" : "Хэрэглэх"}
      </Button>
    )}
  </div>
)

// What the chosen customer holds; only ever shown for this order's customer.
export const CustomerLoyaltyPanel = () => {
  const { loyalty, loading } = useCustomerLoyalty()
  const { voucherId, loading: saving, toggleVoucher } = useLoyaltySelection()

  // A chosen voucher the order no longer meets would fail every later save.
  const chosen = loyalty?.vouchers.find(({ _id }) => _id === voucherId)
  const chosenLost = !!loyalty && !!voucherId && !chosen?.applicable

  // Once per voucher, so a failed save cannot bounce it back and forth.
  const droppedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!chosenLost || !voucherId || saving) return
    if (droppedRef.current === voucherId) return
    droppedRef.current = voucherId
    toggleVoucher(voucherId)
  }, [chosenLost, voucherId, saving, toggleVoucher])

  if (loading) {
    return <Skeleton className="mt-2 h-12 w-full" />
  }

  // No loyalty plugin, or no customer chosen.
  if (!loyalty) {
    return null
  }

  const { wallets, vouchers, status } = loyalty

  if (!wallets.length && !vouchers.length) {
    return (
      <div className="mt-2 text-xs text-neutral-500">Оноо, voucher байхгүй</div>
    )
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border p-2 text-sm">
      {status === "frozen" && (
        <div className="text-xs text-red-500">Данс түр хаагдсан</div>
      )}
      {wallets.map((wallet) => (
        <div
          key={wallet.accountTypeId}
          className="flex items-center justify-between gap-2"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate">{wallet.name || "Оноо"}</span>
            {wallet.tier && <Badge>{wallet.tier.name}</Badge>}
          </div>
          <div className="shrink-0 text-right">
            <div className="font-semibold">{formatNum(wallet.balance)}</div>
            {!!wallet.pending && (
              <div className="text-xs text-neutral-500">
                +{formatNum(wallet.pending)} хүлээгдэж буй
              </div>
            )}
            {wallet.expiringSoon && (
              <div className="text-xs text-amber-600">
                {formatNum(wallet.expiringSoon.amount)}{" "}
                {formatDate(wallet.expiringSoon.expiresAt)}-нд дуусна
              </div>
            )}
          </div>
        </div>
      ))}
      {!!vouchers.length && (
        <div className="divide-y border-t pt-1">
          {vouchers.map((voucher) => (
            <VoucherRow
              key={voucher._id}
              voucher={voucher}
              selected={voucher._id === voucherId}
              saving={saving}
              onToggle={() => toggleVoucher(voucher._id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
