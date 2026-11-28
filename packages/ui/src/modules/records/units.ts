import type { UseQueryOptions } from '@tanstack/react-query';

/** A branch or department as pickers show one: core's `Unit` has more. */
export interface UnitChoice {
  id: string;
  name: string;
  code: string | null;
  parentId: string | null;
}

type UnitRows = { data: UnitChoice[] };

/**
 * Where branch and department pickers read core's units, a kind at a time.
 * TanStack query options; in erxes, `unitQueries` from `@erxes/core-contract/client`.
 */
export interface UnitQueries {
  list: (kind: 'branch' | 'department') => UseQueryOptions<UnitRows, Error, UnitRows>;
}
