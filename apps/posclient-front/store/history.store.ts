import { addDays, formatISO, subDays } from "date-fns"
import { atom } from "jotai"

import { IOrder } from "@/types/order.types"

export const defaultFilter = {
  searchValue: "",
  customerId: "",
  startDate: formatISO(subDays(new Date(), 10)),
  endDate: formatISO(addDays(new Date(), 1)),
  isPaid: undefined,
  perPage: 10,
  page: 1,
  sortField: "modifiedAt",
  sortDirection: -1,
  slotCode: undefined,
}

export const paymentDetailAtom = atom<IOrder | null>(null)
export const openReturnDialogAtom = atom<string | null>(null)

export const HISTORY_FILTER_ID = "orders-history"

export const historyPerPageAtom = atom(defaultFilter.perPage)

export const detailIdAtom = atom<string | null>(null)
