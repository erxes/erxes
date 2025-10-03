import { useSearchParams } from 'react-router-dom';

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
    if (value !== null && value !== query) {
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);
      searchParams.set(queryKey, stringValue);
    } else if (value === null && query !== null) {
      searchParams.delete(queryKey);
    } else {
      return;
    }

    setSearchParams(searchParams);
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
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== queries[key]) {
        const stringValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        searchParams.set(key, stringValue);
      } else if (value === null && queries[key] !== null) {
        searchParams.delete(key);
      }
    });
    setSearchParams(searchParams, { replace: true });
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
  const [searchParams, setSearchParams] = useSearchParams();

  const setQuery = (key: string, value: string) => {
    searchParams.set(key, value);
    setSearchParams(searchParams);
  };

  return setQuery;
}

export function useRemoveQueryStateByKey() {
  const [searchParams, setSearchParams] = useSearchParams();

  const removeQuery = (key: string) => {
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  return removeQuery;
}
