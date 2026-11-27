import { parseDateRangeFromString } from "@/modules/filter"
import { defaultFilter } from "@/store/history.store"
import { formatISO } from "date-fns"

import { IFilter } from "@/types/history.types"
import { IOrderStatus } from "@/types/order.types"
import { ORDER_STATUSES } from "@/lib/constants"
import { useMultiQueryState } from "@/lib/useQueryState"

export type OrdersFilterQueries = {
  searchValue: string
  statuses: string
  types: string
  sort: string
  isPaid: string
  slotCode: string
  isPreExclude: boolean
  created: string
  due: string
}

export const ORDERS_FILTER_QUERY_KEYS: (keyof OrdersFilterQueries)[] = [
  "searchValue",
  "statuses",
  "types",
  "sort",
  "isPaid",
  "slotCode",
  "isPreExclude",
  "created",
  "due",
]

export const DEFAULT_ORDERS_SORT = `${defaultFilter.sortField}_${
  defaultFilter.sortDirection === 1 ? "asc" : "desc"
}`

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String)
  return value === null || value === undefined ? [] : [String(value)]
}

export const useOrdersFilterVariables = (
  allowedStatuses: string[] = ORDER_STATUSES.ALL
): IFilter => {
  const [queries] = useMultiQueryState<OrdersFilterQueries>(
    ORDERS_FILTER_QUERY_KEYS
  )

  const created = parseDateRangeFromString(queries.created)
  const due = parseDateRangeFromString(queries.due)
  const statuses = toList(queries.statuses).filter((status) =>
    allowedStatuses.includes(status)
  )
  const [sortField, sortDirection] = String(
    queries.sort || DEFAULT_ORDERS_SORT
  ).split("_")

  return {
    ...defaultFilter,
    page: 1,
    searchValue: queries.searchValue || "",
    statuses: (statuses.length ? statuses : allowedStatuses) as IOrderStatus[],
    types: toList(queries.types),
    startDate: created ? formatISO(created.from) : defaultFilter.startDate,
    endDate: created ? formatISO(created.to) : defaultFilter.endDate,
    isPaid: queries.isPaid ? queries.isPaid === "paid" : undefined,
    slotCode: queries.slotCode !== null ? String(queries.slotCode) : undefined,
    isPreExclude: queries.isPreExclude === true || undefined,
    sortField,
    sortDirection: sortDirection === "asc" ? 1 : -1,
    dueStartDate: due ? formatISO(due.from) : undefined,
    dueEndDate: due ? formatISO(due.to) : undefined,
  }
}
