import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api';

export const PLAN_KEY = ['plan'];

/** The organisation's plan and standing (self-hosted: `saas: false`). Refreshed every 5 minutes. */
export const usePlan = () =>
  useQuery({ queryKey: PLAN_KEY, queryFn: () => api.saas.plan(), staleTime: 60_000, refetchInterval: 5 * 60_000 });
