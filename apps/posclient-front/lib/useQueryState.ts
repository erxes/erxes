"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface ISearchParamsDraft {
  search: string
  params: URLSearchParams
}

let searchParamsDraft: ISearchParamsDraft | null = null

const getSearchParamsDraft = (search: string): ISearchParamsDraft => {
  if (!searchParamsDraft || searchParamsDraft.search !== search) {
    const draft = { search, params: new URLSearchParams(search) }
    searchParamsDraft = draft
    queueMicrotask(() => {
      if (searchParamsDraft === draft) searchParamsDraft = null
    })
  }
  return searchParamsDraft
}

type NavigationOptions = { replace?: boolean }

const useSearchParamsNavigation = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const search = searchParams.toString()

  const getDraft = () => getSearchParamsDraft(search)

  const commit = (
    draft: ISearchParamsDraft,
    nextParams: URLSearchParams,
    options?: NavigationOptions
  ) => {
    draft.params = new URLSearchParams(nextParams)
    const query = nextParams.toString()
    const href = query ? `${pathname}?${query}` : pathname

    if (options?.replace) {
      router.replace(href, { scroll: false })
      return
    }
    router.push(href, { scroll: false })
  }

  return { searchParams, getDraft, commit }
}

const parseQueryValue = <T>(value: string | null, key: string): T | null => {
  if (!value) return null

  if (key === "searchValue") return value as T

  try {
    return JSON.parse(value) as T
  } catch {
    return value as T
  }
}

const stringifyQueryValue = (value: unknown) =>
  typeof value === "object" ? JSON.stringify(value) : String(value)

export type QueryState<T> = [T | null, (value: T | null) => void]

export function useQueryState<T>(
  queryKey: string,
  options?: { defaultValue?: T }
): QueryState<T> {
  const { searchParams, getDraft, commit } = useSearchParamsNavigation()

  const query =
    parseQueryValue<T>(searchParams.get(queryKey), queryKey) ??
    options?.defaultValue ??
    null

  const setQuery = (value: T | null) => {
    const draft = getDraft()
    const nextParams = new URLSearchParams(draft.params)

    if (value !== null) {
      const stringValue = stringifyQueryValue(value)
      if (nextParams.get(queryKey) === stringValue) return
      nextParams.set(queryKey, stringValue)
    } else if (nextParams.has(queryKey)) {
      nextParams.delete(queryKey)
    } else {
      return
    }

    commit(draft, nextParams)
  }

  return [query, setQuery]
}

type QueryTypes = Record<string, unknown>
type QueryValues<T extends QueryTypes> = {
  [K in keyof T]: T[K] | null
}

export function useMultiQueryState<T extends QueryTypes>(
  queryKeys: (keyof T & string)[]
): [QueryValues<T>, (values: Partial<QueryValues<T>>) => void] {
  const { searchParams, getDraft, commit } = useSearchParamsNavigation()

  const queries = queryKeys.reduce((acc, key) => {
    acc[key] = parseQueryValue<T[typeof key]>(searchParams.get(key), key)
    return acc
  }, {} as QueryValues<T>)

  const setQueries = (values: Partial<QueryValues<T>>) => {
    const draft = getDraft()
    const nextParams = new URLSearchParams(draft.params)
    let hasChanges = false

    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        const stringValue = stringifyQueryValue(value)
        if (nextParams.get(key) === stringValue) return
        nextParams.set(key, stringValue)
        hasChanges = true
      } else if (nextParams.has(key)) {
        nextParams.delete(key)
        hasChanges = true
      }
    })

    if (!hasChanges) return

    commit(draft, nextParams, { replace: true })
  }

  return [queries, setQueries]
}

export function useRemoveQueryStateByKey() {
  const { getDraft, commit } = useSearchParamsNavigation()

  return (key: string) => {
    const draft = getDraft()
    const nextParams = new URLSearchParams(draft.params)
    if (!nextParams.has(key)) return
    nextParams.delete(key)
    commit(draft, nextParams)
  }
}
