import { useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';

/** Self-hosted: the server's erxes license and what it lets plugins do. Refreshed every 5 minutes. */
export const useLicense = () =>
  useQuery(orpc.license.status.queryOptions({ staleTime: 60_000, refetchInterval: 5 * 60_000 }));

/** A license's last day is this close: owners hear about it in time to renew. */
export const ENDING_SOON_DAYS = 30;

export const DAY = 24 * 60 * 60 * 1000;
