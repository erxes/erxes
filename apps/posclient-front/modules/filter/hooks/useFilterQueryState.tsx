import { useSetAtom } from "jotai"

import { QueryState, useQueryState } from "@/lib/useQueryState"

import { filterPageState } from "../states/filterStates"

export function useFilterQueryState<T>(
  queryKey: string,
  sessionKey?: string,
  options?: {
    defaultValue?: T
  }
): QueryState<T> {
  const [query, setQuery] = useQueryState<T>(queryKey, options)
  const setPage = useSetAtom(filterPageState(sessionKey ?? ""))

  return [
    query,
    (value: T | null) => {
      setQuery(value)
      if (sessionKey) {
        setPage(1)
      }
    },
  ]
}
