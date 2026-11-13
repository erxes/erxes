import { useLayoutEffect, useRef } from 'react';
import {
  useLocation,
  useSearchParams,
  type Location,
  type NavigateOptions,
} from 'react-router-dom';

interface ISearchParamsDraft {
  location: Location<unknown>;
  params: URLSearchParams;
  state: unknown;
}

let searchParamsDraft: ISearchParamsDraft | null = null;

// Setters from the same render share pending query and history-state updates.
const getSearchParamsDraft = (location: Location<unknown>): ISearchParamsDraft => {
  if (!searchParamsDraft || searchParamsDraft.location !== location) {
    const draft = {
      location,
      params: new URLSearchParams(location.search),
      state: location.state,
    };

    searchParamsDraft = draft;
    queueMicrotask(() => {
      if (searchParamsDraft === draft) searchParamsDraft = null;
    });
  }

  return searchParamsDraft;
};

/** Returns a reader for pending query changes at the latest router location. */
const useSearchParamsDraft = (): (() => ISearchParamsDraft) => {
  const location = useLocation();
  const latestLocation = useRef(location);

  useLayoutEffect(() => {
    latestLocation.current = location;
  });

  return () => getSearchParamsDraft(latestLocation.current);
};

/** Preserves pending query values and explicit navigation state for the next setter. */
const updateSearchParamsDraft = (
  draft: ISearchParamsDraft,
  nextParams: URLSearchParams,
  navigationOptions?: NavigateOptions,
): void => {
  draft.params = new URLSearchParams(nextParams);

  if (navigationOptions && 'state' in navigationOptions) {
    draft.state = navigationOptions.state;
  }
};

/** Decodes a JSON query value; search text and plain strings stay as written. */
const parseQueryValue = (value: string | null, key: string): unknown => {
  if (!value) return null;

  if (key === 'searchValue') return value;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

/** Strings as written, everything else (numbers, booleans, objects) as JSON. */
const toQueryString = (value: unknown) =>
  typeof value === 'string' ? value : JSON.stringify(value);

type QueryTypes = Record<string, unknown>;

type QueryValues<T extends QueryTypes> = {
  [K in keyof T]: T[K] | null;
};

/**
 * The query values for `keys`, typed as the caller names them (`useQueryState<string>`).
 * The URL is whatever was written there; plugins rely on this contract, so the values
 * are not checked against the type.
 */
const readQueries = <T extends QueryTypes>(params: URLSearchParams, keys: (keyof T)[]) => {
  const values = Object.fromEntries(
    keys.map((key) => [key, parseQueryValue(params.get(String(key)), String(key))]),
  );

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- caller-named query types are the plugin contract of useQueryState; URL values are not validated
  return values as QueryValues<T>;
};

export type QueryState<T> = [
  T | null,
  (value: T | null, navigationOptions?: NavigateOptions) => void,
];

/** Reads and updates one URL query value while preserving concurrent query changes. */
export function useQueryState<T>(
  queryKey: string,
  options?: {
    defaultValue?: T;
  },
): QueryState<T> {
  const [searchParams, setSearchParams] = useSearchParams();
  const getDraft = useSearchParamsDraft();
  const query = readQueries<Record<string, T>>(searchParams, [queryKey])[queryKey] ?? null;
  const value = query ?? options?.defaultValue ?? null;

  /** Updates the requested query key without discarding other pending query changes. */
  const setQuery = (next: T | null, navigationOptions?: NavigateOptions) => {
    const draft = getDraft();
    const nextParams = new URLSearchParams(draft.params);

    if (next !== null) {
      const stringValue = toQueryString(next);

      if (nextParams.get(queryKey) === stringValue && !navigationOptions) return;

      if (!nextParams.has(queryKey) && next === value && !navigationOptions) return;

      nextParams.set(queryKey, stringValue);
    } else if (nextParams.has(queryKey)) {
      nextParams.delete(queryKey);
    } else if (!navigationOptions) {
      return;
    }

    updateSearchParamsDraft(draft, nextParams, navigationOptions);
    setSearchParams(nextParams, { ...navigationOptions, state: draft.state });
  };

  return [value, setQuery];
}

/** Reads and updates several query values through one shared navigation draft. */
export function useMultiQueryState<T extends QueryTypes>(
  queryKeys: (keyof T)[],
): [
  QueryValues<T>,
  (values: Partial<QueryValues<T>>, navigationOptions?: NavigateOptions) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const getDraft = useSearchParamsDraft();
  const queries = readQueries<T>(searchParams, queryKeys);

  /** Applies a batch without discarding other query changes from the same event. */
  const setQueries = (values: Partial<QueryValues<T>>, navigationOptions?: NavigateOptions) => {
    const draft = getDraft();
    const nextParams = new URLSearchParams(draft.params);
    let hasChanges = false;

    for (const [key, value] of Object.entries(values)) {
      if (value !== null) {
        const stringValue = toQueryString(value);

        if (nextParams.get(key) === stringValue) continue;

        nextParams.set(key, stringValue);
        hasChanges = true;
      } else if (nextParams.has(key)) {
        nextParams.delete(key);
        hasChanges = true;
      }
    }

    if (!hasChanges && !navigationOptions) return;

    updateSearchParamsDraft(draft, nextParams, navigationOptions);
    setSearchParams(nextParams, {
      replace: true,
      ...navigationOptions,
      state: draft.state,
    });
  };

  return [queries, setQueries];
}

/** Creates a remover that preserves the remaining query values and router state. */
export function useRemoveQueryStateByKey() {
  const [, setSearchParams] = useSearchParams();
  const getDraft = useSearchParamsDraft();

  /** Removes one query key when present and preserves other pending changes. */
  const removeQuery = (key: string) => {
    const draft = getDraft();
    const nextParams = new URLSearchParams(draft.params);

    if (!nextParams.has(key)) return;

    nextParams.delete(key);
    updateSearchParamsDraft(draft, nextParams);
    setSearchParams(nextParams, { state: draft.state });
  };

  return removeQuery;
}
