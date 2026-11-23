import type React from "react"
import { paymentTypesAtom } from "@/store/config.store"
import {
  coverStatusAtom,
  isCoverAmountsFetchedAtom,
  terminalFetchBusyAtom,
} from "@/store/cover.store"
import { useAtomValue } from "jotai"
import { CalculatorIcon, RefreshCwIcon } from "lucide-react"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"

import { Capitron } from "./capitron"
import { COVER_DATES_FORM_ID } from "./cover-detail-dates"
import { Golomt } from "./golomt"
import { Khaan } from "./Khaan"
import { TDB as Tdb } from "./tdb"

const { KHANBANK, GOLOMT, TDB, CAPITRON } = BANK_CARD_TYPES

export const useCoverBanks = () => {
  const paymentTypes = useAtomValue(paymentTypesAtom)
  const has = (type: string) => !!paymentTypes?.find((pt) => pt.type === type)

  return [
    has(KHANBANK) && <Khaan key={KHANBANK} />,
    has(GOLOMT) && <Golomt key={GOLOMT} />,
    has(TDB) && <Tdb key={TDB} />,
    has(CAPITRON) && <Capitron key={CAPITRON} />,
  ].filter(Boolean)
}

export const CoverTabFieldset = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const status = useAtomValue(coverStatusAtom)
  const busy = useAtomValue(terminalFetchBusyAtom)

  return (
    <fieldset
      disabled={busy || status === "confirm" || status === "confirming"}
      className="flex w-full max-w-3xl flex-col gap-6"
    >
      {children}
    </fieldset>
  )
}

export const EmptyAmounts = () => {
  const isFetched = useAtomValue(isCoverAmountsFetchedAtom)

  if (isFetched) {
    return null
  }

  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CalculatorIcon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-medium">Хаалтын дүн татаагүй байна</h3>
      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
        Дуусах огноо, цагаа сонгоод системийн дүнг татна уу. Дараа нь бэлэн
        мөнгө болон бусад төлбөрөө тоолж оруулна.
      </p>
      <Button
        type="submit"
        form={COVER_DATES_FORM_ID}
        className="mt-5 h-8 gap-1.5 rounded px-3 text-[13px] font-medium"
      >
        <RefreshCwIcon className="size-4" aria-hidden="true" />
        Хаалтын дүн татах
      </Button>
    </div>
  )
}
