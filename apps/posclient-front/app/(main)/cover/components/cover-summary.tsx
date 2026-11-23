import { PanelField, PanelSection } from "@/modules/record-side-panel"
import { isCoverAmountsFetchedAtom } from "@/store/cover.store"
import { useAtomValue } from "jotai"
import {
  BanknoteIcon,
  CalculatorIcon,
  CreditCardIcon,
  ScaleIcon,
  SigmaIcon,
} from "lucide-react"

import { useCoverPayments } from "../hooks/useCoverPayments"
import { Difference, formatAmount } from "./cover-ui"

export const CoverTotals = () => {
  const fetched = useAtomValue(isCoverAmountsFetchedAtom)
  const { rows, totalSystem, totalCounted } = useCoverPayments()

  if (!fetched) return null

  return (
    <>
      <PanelSection title="Нийт" nested>
        <PanelField icon={SigmaIcon} label="Систем">
          <span className="tabular-nums">{formatAmount(totalSystem)}₮</span>
        </PanelField>
        <PanelField icon={CalculatorIcon} label="Тоолсон">
          <span className="tabular-nums">{formatAmount(totalCounted)}₮</span>
        </PanelField>
        <PanelField icon={ScaleIcon} label="Зөрүү">
          <Difference value={totalSystem - totalCounted} />
        </PanelField>
      </PanelSection>
      <PanelSection title="Төлбөр бүрээр" nested>
        {rows.map((row) => (
          <PanelField
            key={row.type}
            icon={row.type === "cashAmount" ? BanknoteIcon : CreditCardIcon}
            label={row.title}
          >
            <span className="flex w-full items-baseline justify-between gap-2">
              <span className="truncate tabular-nums text-muted-foreground">
                {formatAmount(row.counted)} / {formatAmount(row.system)}
              </span>
              <Difference
                value={row.system - row.counted}
                pending={!row.counted && !!row.system}
              />
            </span>
          </PanelField>
        ))}
      </PanelSection>
    </>
  )
}
