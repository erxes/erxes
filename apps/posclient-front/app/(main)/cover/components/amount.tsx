import { TableCell, TableRow } from "@/modules/record-table"
import { currentAmountsAtom, markCoverEditedAtom } from "@/store/cover.store"
import { useAtom, useSetAtom } from "jotai"

import { Detail } from "@/types/cover.types"

import { CoverPaymentRow } from "../hooks/useCoverPayments"
import {
  AmountInput,
  cellInputClass,
  Difference,
  formatAmount,
} from "./cover-ui"

const Amount = ({
  type,
  title,
  system,
  counted,
  className,
}: CoverPaymentRow & { className?: string }) => {
  const [amounts, setAmounts] = useAtom(currentAmountsAtom)
  const markEdited = useSetAtom(markCoverEditedAtom)

  return (
    <TableRow className={className}>
      <TableCell className="px-3 font-medium">
        <span className="block truncate">{title}</span>
      </TableCell>
      <TableCell className="px-3 text-right tabular-nums text-muted-foreground">
        {formatAmount(system)}
      </TableCell>
      <TableCell>
        <AmountInput
          ariaLabel={`${title} тоолсон дүн`}
          value={counted}
          onChange={(next) => {
            setAmounts({ ...amounts, [type]: next })
            markEdited()
          }}
          className={cellInputClass}
        />
      </TableCell>
      <TableCell className="px-3 text-right">
        <Difference value={system - counted} pending={!counted && !!system} />
      </TableCell>
    </TableRow>
  )
}

export const getValueOfPayment = (detail?: Detail) =>
  (detail?.paidSummary || [])[0]?.value || 0

export const handleMap = (arr: Detail[], type: string, value: number) => {
  return arr.map((el) => {
    if (el.paidType === type) {
      return {
        ...el,
        paidSummary: [
          {
            ...el.paidSummary[0],
            amount: value,
            value,
          },
        ],
      }
    }
    return el
  })
}

export default Amount
