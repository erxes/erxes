import type { AutomationFieldPath } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';

/**
 * A field conditions and placeholders can use: the record's or the event's (from the API), an
 * event's own value or an earlier step's output. One that holds a plugin's record id names its
 * `recordType` and the plugin (`source`) that lists those records; one that holds an integration
 * account's id names its `integration`.
 */
export type FieldInfo = AutomationFieldPath & {
  recordType?: string;
  source?: string;
  integration?: string;
  accountKind?: string;
};

/**
 * Fields conditions and placeholders can use, for a record type: its fields as its lists filter
 * them, and the event's. The editor page shows `error`; the builder parts share its cache.
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
