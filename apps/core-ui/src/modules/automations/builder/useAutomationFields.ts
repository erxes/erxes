import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api';

/** `group`: where it comes from, for grouping in the picker (lists' advanced filter). */
export type FieldInfo = {
  path: string;
  label: string;
  type: string;
  options?: string[];
  group?: string;
};

/** Fields conditions and placeholders can use (built-in and custom), for a record type. */
export const useAutomationFields = (subject: 'customer' | 'company' | null) =>
  useQuery({
    queryKey: ['automations', 'fields', subject ?? 'any'],
    queryFn: () => api.automations.fields(subject ? { subject } : {}),
    staleTime: 60_000,
  }).data?.data ?? [];
