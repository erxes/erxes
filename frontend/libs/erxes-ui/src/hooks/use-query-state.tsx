import { useRef } from 'react';
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
const getSearchParamsDraft = (
  location: Location<unknown>,
): ISearchParamsDraft => {
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

const useSearchParamsDraft = (): (() => ISearchParamsDraft) => {
  const location = useLocation();
  const latestLocation = useRef(location);
  latestLocation.current = location;
  return () => getSearchParamsDraft(latestLocation.current);
};

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

// Single key types and hook
export type QueryState<T> = [
  T | null,
  (value: T | null, navigationOptions?: NavigateOptions) => void,
];

export function useQueryState<T>(
  queryKey: string,
  options?: {
    defaultValue?: T;
  },
): QueryState<T> {
  const [searchParams, setSearchParams] = useSearchParams();
  const getDraft = useSearchParamsDraft();

  const parseQueryValue = (value: string | null): T | null => {
    if (!value) {
      if (options?.defaultValue !== undefined) {
        return options.defaultValue;
      }
      return null;
    }

    if (queryKey === 'searchValue') {
      return value as T;
    }

    try {
      const parsed = JSON.parse(value);
      return parsed as T;
    } catch {
      if (value === 'true') return true as T;
      if (value === 'false') return false as T;
      return value as T;
    }
  };

  const query = parseQueryValue(searchParams.get(queryKey));

  const setQuery = (value: T | null, navigationOptions?: NavigateOptions) => {
    const draft = getDraft();
    const nextParams = new URLSearchParams(draft.params);

    if (value !== null) {
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      if (nextParams.get(queryKey) === stringValue && !navigationOptions)
        return;
      if (!nextParams.has(queryKey) && value === query && !navigationOptions)
        return;

      nextParams.set(queryKey, stringValue);
    } else if (nextParams.has(queryKey)) {
      nextParams.delete(queryKey);
    } else if (!navigationOptions) {
      return;
    }

    updateSearchParamsDraft(draft, nextParams, navigationOptions);
    setSearchParams(nextParams, { ...navigationOptions, state: draft.state });
  };

  return [query, setQuery];
}

// Multiple keys types and hook
type QueryTypes = Record<string, unknown>;
type QueryValues<T extends QueryTypes> = {
  [K in keyof T]: T[K] | null;
};

export function useMultiQueryState<T extends QueryTypes>(
  queryKeys: (keyof T)[],
): [
  QueryValues<T>,
  (
    values: Partial<QueryValues<T>>,
    navigationOptions?: NavigateOptions,
  ) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const getDraft = useSearchParamsDraft();

  const parseQueryValue = <K extends keyof T>(
    value: string | null,
    key: K,
  ): T[K] | null => {
    if (!value) return null;

    if (key === 'searchValue') {
      return value as T[K];
    }

    try {
      const parsed = JSON.parse(value);

      return parsed as T[K];
    } catch {
      if (value === 'true') return true as T[K];
      if (value === 'false') return false as T[K];
      return value as T[K];
    }
  };

  const queries = queryKeys.reduce((acc, key) => {
    acc[key] = parseQueryValue(searchParams.get(String(key)), key);
    return acc;
  }, {} as QueryValues<T>);

  const setQueries = (
    values: Partial<QueryValues<T>>,
    navigationOptions?: NavigateOptions,
  ) => {
    const draft = getDraft();
    const nextParams = new URLSearchParams(draft.params);
    let hasChanges = false;

    Object.entries(values).forEach(([key, value]) => {
      if (value !== null) {
        const stringValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);

        if (nextParams.get(key) === stringValue) return;

        nextParams.set(key, stringValue);
        hasChanges = true;
      } else if (nextParams.has(key)) {
        nextParams.delete(key);
        hasChanges = true;
      }
    });

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

export const useNonNullMultiQueryState = <T extends QueryTypes>(
  queryKeys: (keyof T)[],
): QueryValues<T> => {
  const [queries] = useMultiQueryState(queryKeys);

  const nonNullQueries = Object.fromEntries(
    Object.entries(queries).filter(([, value]) => value !== null),
  ) as QueryValues<T>;

  return nonNullQueries;
};

export function useSetQueryStateByKey() {
  const [, setSearchParams] = useSearchParams();
  const getDraft = useSearchParamsDraft();

  const setQuery = (key: string, value: string) => {
    const draft = getDraft();
    const nextParams = new URLSearchParams(draft.params);
    if (nextParams.get(key) === value) return;
    nextParams.set(key, value);
    updateSearchParamsDraft(draft, nextParams);
    setSearchParams(nextParams, { state: draft.state });
  };

  return setQuery;
}

export function useRemoveQueryStateByKey() {
  const [, setSearchParams] = useSearchParams();
  const getDraft = useSearchParamsDraft();

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
