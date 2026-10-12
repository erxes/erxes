import { loyaltyPreviewBonusesAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

// Read-only: the save adds these lines itself, so the cashier never adds them.
export const PreviewBonusItems = () => {
  const bonuses = useAtomValue(loyaltyPreviewBonusesAtom)

  if (!bonuses.length) return null

  return (
    <div className="border-t border-dashed px-4 py-2">
      {bonuses.map(({ productId, name, count }) => (
        <div
          key={productId}
          className="flex items-center justify-between py-1 text-sm"
        >
          <span className="flex items-center gap-2 overflow-hidden">
            <span className="shrink-0 rounded bg-green-100 px-1 text-[10px] font-semibold text-green-700">
              Бонус
            </span>
            <small className="truncate">{name}</small>
          </span>
          <small className="shrink-0 pl-2 font-semibold">
            {count} × 0₮
          </small>
        </div>
      ))}
    </div>
  )
}
