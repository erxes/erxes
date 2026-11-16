import type { AutomationFieldPath } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';

/**
 * A field conditions and placeholders can use: a record's (from the API) or an earlier step's
 * output, with `group` for where it comes from.
 */
export type FieldInfo = AutomationFieldPath & { group?: string; currency?: string };

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
