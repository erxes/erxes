import { useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';

/**
 * A field conditions and placeholders can use: a record's (from the API) or
 * an earlier step's output. `group`: where it comes from, for grouping in the
 * picker (lists' advanced filter).
 */
export type FieldInfo = {
  path: string;
  label: string;
  type: string;
  options?: string[];
  group?: string;
  /** A money amount, stored in this currency's smallest unit and typed in its major unit. */
  currency?: string;
};

/**
 * Fields conditions and placeholders can use (built-in and custom), for a
 * record type. The editor page shows `error`; the builder parts share its cache.
 */
export const useAutomationFields = (subject: 'customer' | 'company' | null) => {
  const query = useQuery(
    orpc.automations.fields.queryOptions({
      input: subject ? { subject } : {},
      staleTime: 60_000,
    }),
  );

  return { fields: query.data?.data ?? [], error: query.error };
};
