import { useSearchParams } from 'react-router-dom';

let searchParamsDraft: URLSearchParams | null = null;
let draftSourceSearch = '';

const getSearchParamsDraft = () => {
  const currentSearch = window.location.search;
  const draftSearch = searchParamsDraft?.toString();
  const draftTargetSearch = draftSearch ? `?${draftSearch}` : '';

  if (
    !searchParamsDraft ||
    (draftSourceSearch !== currentSearch && draftTargetSearch !== currentSearch)
  ) {
    draftSourceSearch = currentSearch;
    searchParamsDraft = new URLSearchParams(currentSearch);

    queueMicrotask(() => {
      searchParamsDraft = null;
      draftSourceSearch = '';
    });
  }

  return new URLSearchParams(searchParamsDraft);
};

const updateSearchParamsDraft = (nextParams: URLSearchParams) => {
  searchParamsDraft = new URLSearchParams(nextParams);
};

// Single key types and hook
export type QueryState<T> = [T | null, (value: T | null) => void];

export function useQueryState<T>(
  queryKey: string,
  options?: {
    defaultValue?: T;
  },
): QueryState<T> {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const setQuery = (value: T | null) => {
    const nextParams = getSearchParamsDraft();

    if (value !== null) {
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      if (nextParams.get(queryKey) === stringValue) return;
      if (!nextParams.has(queryKey) && value === query) return;

      nextParams.set(queryKey, stringValue);
    } else if (nextParams.has(queryKey)) {
      nextParams.delete(queryKey);
    } else {
      return;
    }

    updateSearchParamsDraft(nextParams);
    setSearchParams(nextParams);
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
): [QueryValues<T>, (values: Partial<QueryValues<T>>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const setQueries = (values: Partial<QueryValues<T>>) => {
    const nextParams = getSearchParamsDraft();
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

    if (!hasChanges) return;

    updateSearchParamsDraft(nextParams);
    setSearchParams(nextParams, { replace: true });
  };

  return [queries, setQueries];
}

export const useNonNullMultiQueryState = <T extends QueryTypes>(
  queryKeys: (keyof T)[],
): QueryValues<T> => {
  const [queries] = useMultiQueryState(queryKeys);

  const nonNullQueries = Object.fromEntries(
    Object.entries(queries).filter(([_, value]) => value !== null),
  ) as QueryValues<T>;

  return nonNullQueries;
};

export function useSetQueryStateByKey() {
  const [, setSearchParams] = useSearchParams();

  const setQuery = (key: string, value: string) => {
    const nextParams = getSearchParamsDraft();
    if (nextParams.get(key) === value) return;
    nextParams.set(key, value);
    updateSearchParamsDraft(nextParams);
    setSearchParams(nextParams);
  };

  return setQuery;
}

export function useRemoveQueryStateByKey() {
  const [, setSearchParams] = useSearchParams();

  const removeQuery = (key: string) => {
    const nextParams = getSearchParamsDraft();
    if (!nextParams.has(key)) return;
    nextParams.delete(key);
    updateSearchParamsDraft(nextParams);
    setSearchParams(nextParams);
  };

  return removeQuery;
}
