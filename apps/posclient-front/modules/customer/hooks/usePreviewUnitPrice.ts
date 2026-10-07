import { loyaltyPreviewAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

// The price a save would give an unsaved line; a saved line keeps its own.
export const usePreviewUnitPrice = (itemId: string, unitPrice: number) => {
  const preview = useAtomValue(loyaltyPreviewAtom)
  const previewPrice = preview[itemId]?.unitPrice
  const isPreviewed = previewPrice != null && previewPrice < unitPrice

  return {
    price: isPreviewed ? previewPrice : unitPrice,
    originalPrice: isPreviewed ? unitPrice : null,
  }
}
