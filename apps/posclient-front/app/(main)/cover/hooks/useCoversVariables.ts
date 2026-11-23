import { parseDateRangeFromString } from "@/modules/filter"
import { endOfDay, startOfDay, subDays } from "date-fns"

import { useMultiQueryState } from "@/lib/useQueryState"

export type CoversFilterQueries = {
  created: string
  status: string
}

export const COVERS_FILTER_QUERY_KEYS: (keyof CoversFilterQueries)[] = [
  "created",
  "status",
]

export const COVERS_FILTER_ID = "covers"

const DEFAULT_DAYS = 15

export const useCoversVariables = () => {
  const [queries] = useMultiQueryState<CoversFilterQueries>(
    COVERS_FILTER_QUERY_KEYS
  )
  const range = parseDateRangeFromString(queries.created)
  const today = new Date()

  return {
    startDate: range?.from ?? startOfDay(subDays(today, DEFAULT_DAYS)),
    endDate: range?.to ?? endOfDay(today),
    status: queries.status !== null ? String(queries.status) : null,
  }
}
