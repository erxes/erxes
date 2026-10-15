import { format } from "date-fns"

import { formatNum } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { LoyaltySummary } from "../hooks/useLoyaltySummary"
import { CouponInput } from "./CouponInput"
import { LoyaltyEarnPreview } from "./LoyaltyEarnPreview"

const formatDate = (value?: string | null) =>
  value ? format(new Date(value), "yyyy.MM.dd") : ""

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="space-y-1.5 border-t pt-3">
    <div className="text-xs font-medium text-neutral-500">{title}</div>
    {children}
  </div>
)

// The whole of what the customer holds, opened from the sidebar row.
export const LoyaltyDialog = ({
  open,
  onOpenChange,
  title,
  summary,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  summary: LoyaltySummary
}) => {
  const {
    loyalty,
    groups,
    frozen,
    saving,
    toggleVoucher,
    acceptCoupons,
    couponCode,
  } = summary

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {!!loyalty && (
          <Section title="Wallets">
            {frozen && (
              <div className="text-xs text-red-500">Данс түр хаагдсан</div>
            )}
            {loyalty.wallets.map((wallet) => (
              <div
                key={wallet.accountTypeId}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate">{wallet.name || "Оноо"}</span>
                  {wallet.tier && <Badge>{wallet.tier.name}</Badge>}
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-semibold">
                    {formatNum(wallet.balance)}
                  </div>
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
            <LoyaltyEarnPreview
              className={loyalty.wallets.length ? undefined : "border-t-0 pt-0"}
            />
          </Section>
        )}

        {!!groups.length && (
          <Section title="Voucher">
            {groups.map((group) => (
              <div
                key={group.key}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <div
                    className={
                      group.applicable
                        ? "truncate font-medium"
                        : "truncate font-medium text-neutral-400"
                    }
                  >
                    {group.title} {group.valueText}
                    {group.count > 1 && (
                      <span className="ml-1 text-xs text-neutral-500">
                        ×{group.count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {group.expiresAt &&
                      `${formatDate(group.expiresAt)} хүртэл`}
                    {group.reason && (
                      <span className="text-red-500"> · {group.reason}</span>
                    )}
                  </div>
                </div>
                {group.autoApplied ? (
                  <Badge variant="secondary" className="shrink-0">
                    Автоматаар
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant={group.selected ? "default" : "outline"}
                    className="h-7 shrink-0 px-2 text-xs"
                    disabled={saving || !group.applicable}
                    onClick={() => toggleVoucher(group.voucherId)}
                  >
                    {group.selected ? "Хэрэглэж байна" : "Хэрэглэх"}
                  </Button>
                )}
              </div>
            ))}
          </Section>
        )}

        {(acceptCoupons || !!couponCode) && (
          <Section title="Coupon">
            <CouponInput />
          </Section>
        )}
      </DialogContent>
    </Dialog>
  )
}
