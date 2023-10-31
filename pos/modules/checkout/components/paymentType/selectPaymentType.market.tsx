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

import { useCheckNotSplit } from "../../hooks/usePaymentType"
import usePossiblePaymentTerms from "../../hooks/usePossiblePaymentTerms"

const SelectPaymentType = () => {
  const {
    loadingKhan,
    disabledTerms,
    paymentIds,
    khan,
    tdb,
    golomt,
    mappedPts,
  } = usePossiblePaymentTerms()
  const type = useAtomValue(currentPaymentTypeAtom)
  const { handleSetType } = useCheckNotSplit()

  return (
    <Select disabled={loadingKhan} value={type} onValueChange={handleSetType}>
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
              Хаан банк
            </SelectItem>
          )}
          {!!tdb && (
            <SelectItem value={BANK_CARD_TYPES.TDB} disabled={disabledTerms}>
              ХXБанк
            </SelectItem>
          )}
          {!!golomt && (
            <SelectItem value={BANK_CARD_TYPES.GOLOMT} disabled={disabledTerms}>
              Голомт банк
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
