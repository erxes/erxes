import { usePathname, useRouter } from "next/navigation"
import { paymentTypesAtom } from "@/store/config.store"
import {
  coverStatusAtom,
  coverValidationAttemptedAtom,
  endDateAtom,
  isCoverAmountsFetchedAtom,
  resetCoverDetailAtom,
  terminalFetchBusyAtom,
  terminalResultsAtom,
} from "@/store/cover.store"
import { useAtomValue, useSetAtom } from "jotai"
import { AlarmCheckIcon } from "lucide-react"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { useRemoveQueryStateByKey } from "@/lib/useQueryState"
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
  const pathname = usePathname()
  const removeQuery = useRemoveQueryStateByKey()
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
      toast({ description: "Хаалт хадгалагдлаа", variant: "success" })
      resetCover()
      if (pathname.startsWith("/cover/detail")) router.push("/cover")
      else removeQuery("id")
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error))
    }
  }
  if (!endDate || !fetched) return null
  return (
    <Button
      className="h-8 w-full gap-1.5 rounded text-[13px] font-medium"
      loading={loading}
      disabled={busy || status === "confirm" || status === "confirming"}
      onClick={handleClick}
    >
      {!loading && <AlarmCheckIcon className="h-4 w-4" />}
      Хаалт хадгалах
    </Button>
  )
}
