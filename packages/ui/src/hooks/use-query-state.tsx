import { useLayoutEffect, useRef } from 'react';
import {
  useLocation,
  useSearchParams,
  type Location,
  type NavigateOptions,
} from 'react-router-dom';
import { z } from 'zod';
import { jsonOf } from 'erxes-ui/utils/json';

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

/**
 * The query value in the form its schema takes: as written (strings), else as
 * JSON (numbers, booleans, arrays, objects). Anyone can edit a URL, so a value
 * that fits neither is undefined, read as absent.
 */
const queryInput = (schema: z.ZodType, value: string | null) => {
  if (!value) return undefined;

  if (schema.safeParse(value).success) return value;

  const decoded = jsonOf(z.json()).safeParse(value);

  return decoded.success && schema.safeParse(decoded.data).success ? decoded.data : undefined;
};

/** Strings as written, everything else (numbers, booleans, objects) as JSON. */
const toQueryString = (value: unknown) =>
  typeof value === 'string' ? value : JSON.stringify(value);

type QuerySchemas = Record<string, z.ZodType>;

/** Values to write; null removes the key, a missing key stays as it is. */
type QueryValues<S extends QuerySchemas> = {
  [K in keyof S]?: z.output<S[K]> | null;
};

export type QueryState<T> = [
  T | null,
  (value: T | null, navigationOptions?: NavigateOptions) => void,
];

/** Reads and updates one URL query value while preserving concurrent query changes. */
export function useQueryState<S extends z.ZodType>(
  queryKey: string,
  schema: S,
): QueryState<z.output<S>> {
  const [searchParams, setSearchParams] = useSearchParams();
  const getDraft = useSearchParamsDraft();
  const value = schema.safeParse(queryInput(schema, searchParams.get(queryKey))).data ?? null;

  /** Updates the requested query key without discarding other pending query changes. */
  const setQuery = (next: z.output<S> | null, navigationOptions?: NavigateOptions) => {
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

/**
 * Reads and updates several query values through one shared navigation draft.
 * Each key's value is checked against its schema; absent and invalid ones are undefined.
 */
export function useMultiQueryState<S extends QuerySchemas>(schemas: S) {
  const [searchParams, setSearchParams] = useSearchParams();
  const getDraft = useSearchParamsDraft();

  const queries = z
    .object(schemas)
    .partial()
    .parse(
      Object.fromEntries(
        Object.entries(schemas).map(([key, schema]) => [
          key,
          queryInput(schema, searchParams.get(key)),
        ]),
      ),
    );

  /** Applies a batch without discarding other query changes from the same event. */
  const setQueries = (values: QueryValues<S>, navigationOptions?: NavigateOptions) => {
    const draft = getDraft();
    const nextParams = new URLSearchParams(draft.params);
    let hasChanges = false;

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) continue;

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

  return [queries, setQueries] as const;
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
