import { parseDateRangeFromString } from "@/modules/filter"
import { endOfDay, startOfDay } from "date-fns"

import { useMultiQueryState } from "@/lib/useQueryState"

export type OrderLogsFilterQueries = {
  searchValue: string
  source: string
  user: string
  created: string
}

export const ORDER_LOGS_FILTER_QUERY_KEYS: (keyof OrderLogsFilterQueries)[] = [
  "searchValue",
  "source",
  "user",
  "created",
]

export const ORDER_LOGS_FILTER_ID = "order-logs"

export const ORDER_LOGS_PER_PAGE = 50

export const useOrderLogsVariables = () => {
  const [queries] = useMultiQueryState<OrderLogsFilterQueries>(
    ORDER_LOGS_FILTER_QUERY_KEYS
  )
  const range = parseDateRangeFromString(queries.created)
  const today = new Date()

  return {
    orderNumber: queries.searchValue?.trim() || undefined,
    source: queries.source !== null ? String(queries.source) : undefined,
    userId: queries.user !== null ? String(queries.user) : undefined,
    startDate: (range?.from ?? startOfDay(today)).toISOString(),
    endDate: (range?.to ?? endOfDay(today)).toISOString(),
  }
}
