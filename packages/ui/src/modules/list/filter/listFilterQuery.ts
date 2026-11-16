import { parseAsJson, parseAsString, useQueryStates } from 'nuqs';
import { ConditionGroup, type TConditionGroup } from '../../conditions/conditions';

/**
 * The URL params holding a list's filter, as nuqs parsers.
 * Shared links and reloads keep the filter: `advanced` is the condition group as JSON, and
 * `searchValue` the search.
 */
export const listFilterQuery = {
  // Anyone can edit a URL: a filter that doesn't parse reads as none.
  advanced: parseAsJson((value) => ConditionGroup.safeParse(value).data ?? null),
  searchValue: parseAsString,
};

/** The list's conditions (null without any) and search, and how the bar changes them. */
export const useListConditions = () => {
  const [{ advanced, searchValue }, setQueries] = useQueryStates(listFilterQuery, {
    history: 'replace',
  });

  return {
    advanced: advanced?.rules.length ? advanced : null,
    search: searchValue,
    setAdvanced: (next: TConditionGroup | null) =>
      void setQueries({ advanced: next?.rules.length ? next : null }),
  };
};
