import { addDays, formatISO, subDays } from "date-fns"
import { atom } from "jotai"

import { IFilter } from "@/types/history.types"
import { IOrder } from "@/types/order.types"
import { ORDER_STATUSES } from "@/lib/constants"

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

export const openCancelDialogAtom = atom<string | null>(null)
export const paymentDetailAtom = atom<IOrder | null>(null)
export const openReturnDialogAtom = atom<string | null>(null)

export const filterAtom = atom<IFilter>({
  ...defaultFilter,
  statuses: ORDER_STATUSES.ALL,
})

export const detailIdAtom = atom<string | null>(null)
