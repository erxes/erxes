import { PanelField, PanelSection } from "@/modules/record-side-panel"
import {
  cashAtom,
  currentCashTotalAtom,
  markCoverEditedAtom,
} from "@/store/cover.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { BanknoteIcon, SigmaIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { AmountInput, formatAmount } from "./cover-ui"

const CashAmounts = () => {
  const [cash, setCash] = useAtom(cashAtom)
  const cashTotal = useAtomValue(currentCashTotalAtom)
  const markEdited = useSetAtom(markCoverEditedAtom)

  const onChange = (count: number, idx: number) => {
    setCash({
      ...cash,
      paidSummary: (cash.paidSummary || []).map((p, i) =>
        i !== idx
          ? p
          : {
              ...p,
              value: count,
              amount: count * p.kindOfVal,
              kind: p.kindOfVal + "",
            }
      ),
    })
    markEdited()
  }

  return (
    <PanelSection title="Бэлэн мөнгө" nested>
      {(cash.paidSummary || []).map(({ kindOfVal, value }, idx) => (
        <PanelField
          key={kindOfVal}
          icon={BanknoteIcon}
          label={`${formatAmount(kindOfVal)}₮`}
          bare
        >
          <div className="flex min-w-0 items-center gap-2">
            <AmountInput
              ariaLabel={`${kindOfVal}₮ дэвсгэртийн тоо`}
              value={value}
              onChange={(next) => onChange(next, idx)}
              className="w-20 flex-none text-xs"
            />
            <span
              className={cn(
                "ml-auto truncate pr-2 text-xs tabular-nums",
                value ? "font-medium" : "text-zinc-400"
              )}
            >
              {formatAmount((value || 0) * kindOfVal)}₮
            </span>
          </div>
        </PanelField>
      ))}
      <PanelField icon={SigmaIcon} label="Нийт тоолсон">
        <span className="ml-auto font-semibold tabular-nums">
          {formatAmount(cashTotal)}₮
        </span>
      </PanelField>
    </PanelSection>
  )
}

export default CashAmounts
