import { useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';

/** The organisation's plan and standing (self-hosted: `saas: false`). Refreshed every 5 minutes. */
export const usePlan = () =>
  useQuery(orpc.saas.plan.queryOptions({ staleTime: 60_000, refetchInterval: 5 * 60_000 }));
