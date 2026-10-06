import { useState } from "react"
import { TicketIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useLoyaltySelection } from "../hooks/useLoyaltySelection"

// A coupon is a code anyone may hold, so it needs no customer.
export const CouponInput = () => {
  const { couponCode, loading, applyCoupon, clearCoupon } =
    useLoyaltySelection()
  const [value, setValue] = useState("")
  // Known only for a code applied here; a reopened order shows the code alone.
  const [title, setTitle] = useState<string | null>(null)

  if (couponCode) {
    return (
      <div className="mt-2 flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-sm">
        <span className="flex min-w-0 items-center gap-1.5">
          <TicketIcon className="h-4 w-4 shrink-0" />
          <span className="truncate font-medium">{couponCode}</span>
          {title && title !== couponCode && (
            <span className="truncate text-xs text-neutral-500">{title}</span>
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={loading}
          onClick={() => {
            setTitle(null)
            clearCoupon()
          }}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const submit = async () => {
    const applied = await applyCoupon(value)
    if (applied === null) return
    setTitle(applied)
    setValue("")
  }

  return (
    <div className="mt-2 flex gap-2">
      <Input
        value={value}
        placeholder="Coupon код"
        className="h-8"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        disabled={loading || !value.trim()}
        onClick={submit}
      >
        Хэрэглэх
      </Button>
    </div>
  )
}
