import { useEffect, useState } from "react"
import { currentPaymentTypeAtom } from "@/store"
import { useAtomValue } from "jotai"

import { BANK_CARD_TYPES } from "@/lib/constants"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import usePaymentLabel from "../../hooks/usePaymentLabel"
import { useCheckNotSplit } from "../../hooks/usePaymentType"
import usePossiblePaymentTerms from "../../hooks/usePossiblePaymentTerms"

const SelectPaymentType = ({ onSelect }: { onSelect?: () => void }) => {
  const {
    loadingKhan,
    disabledTerms,
    paymentIds,
    khan,
    tdb,
    capitron,
    golomt,
    mappedPts,
    notPaidAmount,
  } = usePossiblePaymentTerms()
  const { getLabel } = usePaymentLabel()
  const type = useAtomValue(currentPaymentTypeAtom)
  const { handleSetType } = useCheckNotSplit()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    !!notPaidAmount && setOpen(true)
  }, [notPaidAmount])

  const handleValueChange = (value: string) => {
    handleSetType(value)
    onSelect && onSelect()
  }

  return (
    <Select
      disabled={loadingKhan}
      value={type}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={(op) => setOpen(op)}
    >
      <SelectTrigger>
        <SelectValue placeholder="сонгох" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="cash" disabled={disabledTerms}>
            Бэлнээр
          </SelectItem>
          {!!paymentIds?.length && (
            <SelectItem value="mobile" disabled={disabledTerms}>
              Цахимаар
            </SelectItem>
          )}

          {khan && (
            <SelectItem
              value={BANK_CARD_TYPES.KHANBANK}
              disabled={disabledTerms}
            >
              {getLabel(BANK_CARD_TYPES.KHANBANK)}
            </SelectItem>
          )}
          {!!tdb && (
            <SelectItem value={tdb.type} disabled={disabledTerms}>
              {getLabel(tdb.type)}
            </SelectItem>
          )}
          {!!capitron && (
            <SelectItem value={capitron.type} disabled={disabledTerms}>
              {getLabel(capitron.type)}
            </SelectItem>
          )}
          {!!golomt && (
            <SelectItem value={BANK_CARD_TYPES.GOLOMT} disabled={disabledTerms}>
              {getLabel(BANK_CARD_TYPES.GOLOMT)}
            </SelectItem>
          )}
          {mappedPts.map((payment) => (
            <SelectItem
              value={payment.type}
              disabled={payment.disabled || disabledTerms}
              key={payment.type}
            >
              {payment.title}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default SelectPaymentType
