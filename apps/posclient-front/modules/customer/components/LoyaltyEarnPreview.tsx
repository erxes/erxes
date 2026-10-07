import { formatNum } from "@/lib/utils"

import { useLoyaltyEarnPreview } from "../hooks/useLoyaltyEarnPreview"

const REASON_TEXT: Record<string, string> = {
  "no-rows": "оноо өгөх мөр тохируулаагүй",
  "no-tier-value": "энэ зэрэглэлд утга тохируулаагүй",
  "conditions-not-met": "нөхцөл хангагдаагүй",
  "no-amount": "тооцох дүн алга",
  "rounded-to-zero": "дүн бага тул 0 болсон",
  "held-past-reset": "хүлээгдэх хугацаа reset-ээс хойш дуусна",
}

const reasonText = (reasons: string[]) =>
  reasons.map((reason) => REASON_TEXT[reason] || reason).join(", ")

// Said before paying, so a rule that stopped giving points shows at the till.
export const LoyaltyEarnPreview = () => {
  const { result, error } = useLoyaltyEarnPreview()

  if (error) {
    return (
      <div className="text-xs text-red-500">
        Оноог урьдчилан тооцож чадсангүй: {error.message}
      </div>
    )
  }

  if (!result) return null

  if (!result.hasRules) {
    return (
      <div className="text-xs text-amber-600">
        Энэ POS дээр оноо өгөх идэвхтэй дүрэм алга
      </div>
    )
  }

  return (
    <div className="space-y-0.5 border-t pt-1">
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
