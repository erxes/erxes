import { useRouter } from "next/navigation"
import { useAtomValue, useSetAtom } from "jotai"
import { AlarmCheckIcon } from "lucide-react"
import {
  isCoverAmountsFetchedAtom,
  endDateAtom,
  resetCoverDetailAtom,
  terminalFetchBusyAtom,
  coverStatusAtom,
  terminalResultsAtom,
  coverValidationAttemptedAtom,
} from "@/store/cover.store"
import { paymentTypesAtom } from "@/store/config.store"
import { BANK_CARD_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { onError, toast } from "@/components/ui/use-toast"
import { useCoverSave } from "../hooks/useCoverSave"

export const CoverCU = () => {
  const endDate = useAtomValue(endDateAtom)
  const fetched = useAtomValue(isCoverAmountsFetchedAtom)
  const busy = useAtomValue(terminalFetchBusyAtom)
  const status = useAtomValue(coverStatusAtom)
  const paymentTypes = useAtomValue(paymentTypesAtom) || []
  const terminalResults = useAtomValue(terminalResultsAtom)
  const setValidationAttempted = useSetAtom(coverValidationAttemptedAtom)
  const resetCover = useSetAtom(resetCoverDetailAtom)
  const router = useRouter()
  const { loading, saveCover } = useCoverSave()
  const handleClick = async () => {
    setValidationAttempted(true)
    const missingBank = Object.values(BANK_CARD_TYPES).find(
      (bank) =>
        paymentTypes.some((payment) => payment.type === bank) &&
        !terminalResults.some(
          (result) => result.bank === bank && !!result.response?.trim()
        )
    )
    if (missingBank) {
      document
        .getElementById(`cover-terminal-description-${missingBank}`)
        ?.focus()
      return
    }
    try {
      await saveCover()
      toast({ description: "Хаалт хадгалагдлаа" })
      resetCover()
      router.push("/cover")
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error))
    }
  }
  if (!endDate || !fetched) return null
  return (
    <Button
      className="mt-4"
      loading={loading}
      disabled={busy || status === "confirm" || status === "confirming"}
      onClick={handleClick}
    >
      <AlarmCheckIcon className="mr-1 h-4 w-4 -translate-x-1" />
      Хадгалах
    </Button>
  )
}
