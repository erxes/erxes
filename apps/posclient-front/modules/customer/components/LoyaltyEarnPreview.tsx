import { cn, formatNum } from "@/lib/utils"

import { useLoyaltyEarnPreview } from "../hooks/useLoyaltyEarnPreview"

const REASON_TEXT: Record<string, string> = {
  "no-rows": "оноо өгөх мөр тохируулаагүй",
  "no-tier-value": "энэ зэрэглэлд утга тохируулаагүй",
  "conditions-not-met": "нөхцөл хангагдаагүй",
  "no-amount": "тооцох дүн алга",
  "rounded-to-zero": "дүн бага тул 0 болсон",
  "held-past-reset": "хүлээгдэх хугацаа reset-ээс хойш дуусна",
  "not-eligible": "энэ wallet-д оноо авах шаардлага хангаагүй",
}

const reasonText = (reasons: string[]) =>
  reasons.map((reason) => REASON_TEXT[reason] || reason).join(", ")

// Said before paying, so a rule that stopped giving points shows at the till.
export const LoyaltyEarnPreview = ({ className }: { className?: string }) => {
  const { result, error } = useLoyaltyEarnPreview()

  if (error) {
    return (
      <div className={cn("text-xs text-red-500", className)}>
        Оноог урьдчилан тооцож чадсангүй: {error.message}
      </div>
    )
  }

  // Setup is the admin's to fix; the cashier sees nothing without rules.
  if (!result?.hasRules) return null

  return (
    <div className={cn("space-y-0.5 border-t pt-1", className)}>
      {result.earns.map(({ walletName, points, reasons, error }, index) => (
        <div
          key={`${walletName}-${index}`}
          className="flex items-start justify-between gap-2 text-xs"
        >
          <span className="text-neutral-500">
            Энэ худалдан авалтаар{walletName ? ` · ${walletName}` : ""}
          </span>
          {error ? (
            <span className="text-right text-red-500">{error}</span>
          ) : points > 0 ? (
            <span className="shrink-0 font-semibold text-green-700">
              +{formatNum(points)} оноо
            </span>
          ) : (
            <span className="text-right text-amber-600">
              0 оноо{reasons.length ? ` — ${reasonText(reasons)}` : ""}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
