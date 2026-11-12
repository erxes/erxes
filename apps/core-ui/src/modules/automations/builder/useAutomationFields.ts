import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api';

export type FieldInfo = { path: string; label: string; type: string; options?: string[] };

/** Fields conditions and placeholders can use (built-in and custom), for a record type. */
export const useAutomationFields = (subject: 'customer' | 'company' | null) =>
  useQuery({
    queryKey: ['automations', 'fields', subject ?? 'any'],
    queryFn: () => api.automations.fields(subject ? { subject } : {}),
    staleTime: 60_000,
  }).data?.data ?? [];
