import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import { configAtom } from "@/store/config.store"
import {
  calcAmountsAtom,
  calcCashAtom,
  currentAmountsAtom,
  currentCashTotalAtom,
} from "@/store/cover.store"
import { useAtomValue } from "jotai"

import { ALL_BANK_CARD_TYPES } from "@/lib/constants"

export type CoverPaymentRow = {
  type: string
  title: string
  system: number
  counted: number
  isBank: boolean
}

export const useCoverPayments = () => {
  const { paymentTypes, paymentIds } = useAtomValue(configAtom) || {}
  const calcAmounts = useAtomValue(calcAmountsAtom) || {}
  const currentAmounts = useAtomValue(currentAmountsAtom)
  const calcCash = useAtomValue(calcCashAtom)
  const cashTotal = useAtomValue(currentCashTotalAtom)
  const { getLabel } = usePaymentLabel()

  const types = (paymentTypes || []).map((pt) => ({
    type: pt.type,
    title: ALL_BANK_CARD_TYPES.includes(pt.type) ? getLabel(pt.type) : pt.title,
  }))
  if (paymentIds?.length) {
    types.push({ type: "mobile", title: getLabel("mobile") })
  }

  const payments: CoverPaymentRow[] = types.map(({ type, title }) => ({
    type,
    title,
    system: calcAmounts[type] || 0,
    counted: currentAmounts[type] || 0,
    isBank: ALL_BANK_CARD_TYPES.includes(type),
  }))

  const cash: CoverPaymentRow = {
    type: "cashAmount",
    title: "Бэлэн мөнгө",
    system: calcCash,
    counted: cashTotal,
    isBank: false,
  }

  const rows = [cash, ...payments]

  return {
    cash,
    payments,
    rows,
    totalSystem: rows.reduce((sum, row) => sum + row.system, 0),
    totalCounted: rows.reduce((sum, row) => sum + row.counted, 0),
  }
}
