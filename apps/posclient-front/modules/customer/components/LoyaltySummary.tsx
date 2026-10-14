import { useState } from "react"
import { customerAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"
import { ChevronRightIcon, StarIcon, TicketIcon, XIcon } from "lucide-react"

import { cn, formatNum, getCustomerLabel } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { useLoyaltySummary } from "../hooks/useLoyaltySummary"
import { voucherValueText } from "../utils/voucherGroups"
import { LoyaltyDialog } from "./LoyaltyDialog"

const Chip = ({
  children,
  tone = "muted",
  onRemove,
  disabled,
}: {
  children: React.ReactNode
  tone?: "muted" | "accent" | "danger"
  onRemove?: () => void
  disabled?: boolean
}) => (
  <span
    className={cn(
      "inline-flex max-w-full items-center gap-1 rounded px-1.5 py-0.5",
      tone === "muted" && "bg-neutral-100 text-neutral-700",
      tone === "accent" && "bg-indigo-50 text-indigo-700",
      tone === "danger" && "bg-red-50 text-red-600"
    )}
  >
    <span className="flex min-w-0 items-center gap-1 truncate">
      {children}
    </span>
    {onRemove && (
      <button
        type="button"
        aria-label="Хасах"
        disabled={disabled}
        onClick={onRemove}
      >
        <XIcon className="h-3 w-3" />
      </button>
    )}
  </span>
)

// One row under the customer however much they hold; the rest is a dialog.
export const LoyaltySummary = () => {
  const customer = useAtomValue(customerAtom)
  const [open, setOpen] = useState(false)
  const summary = useLoyaltySummary()
  const {
    loading,
    visible,
    frozen,
    wallet,
    chosen,
    couponCode,
    singlePick,
    morePicks,
    saving,
    toggleVoucher,
    clearCoupon,
  } = summary

  if (loading) {
    return <Skeleton className="mt-2 h-8 w-full" />
  }

  if (!visible) {
    return null
  }

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-md border p-1.5 text-xs">
        {frozen && <Chip tone="danger">Данс хаагдсан</Chip>}
        {wallet && (
          <Chip>
            <StarIcon className="h-3 w-3 shrink-0" />
            {formatNum(wallet.balance)}
            {wallet.tier && ` · ${wallet.tier.name}`}
          </Chip>
        )}
        {chosen && (
          <Chip
            tone="accent"
            disabled={saving}
            onRemove={() => toggleVoucher(chosen._id)}
          >
            <TicketIcon className="h-3 w-3 shrink-0" />
            {chosen.title} {voucherValueText(chosen)}
          </Chip>
        )}
        {couponCode && (
          <Chip tone="accent" disabled={saving} onRemove={clearCoupon}>
            <TicketIcon className="h-3 w-3 shrink-0" />
            {couponCode}
          </Chip>
        )}
        {singlePick && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            disabled={saving}
            onClick={() => toggleVoucher(singlePick.voucherId)}
          >
            {singlePick.title} {singlePick.valueText} · Хэрэглэх
          </Button>
        )}
        {morePicks > 0 && (
          <span className="text-neutral-500">+{morePicks} voucher</span>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto h-6 px-1.5 text-xs font-medium text-indigo-700"
          onClick={() => setOpen(true)}
        >
          Loyalty
          <ChevronRightIcon className="h-3 w-3" />
        </Button>
      </div>
      <LoyaltyDialog
        open={open}
        onOpenChange={setOpen}
        title={
          customer
            ? `${
                [customer.firstName, customer.lastName]
                  .filter(Boolean)
                  .join(" ") || getCustomerLabel(customer)
              } — loyalty`
            : "Coupon"
        }
        summary={summary}
      />
    </>
  )
}
