import type { coreContract } from '@erxes/core-contract';
import type { InferContractRouterOutputs } from '@orpc/contract';
import { orpc } from '~/lib/api';

/** Triggers and actions: core's and installed plugins'. */
export type Catalog = InferContractRouterOutputs<typeof coreContract>['automations']['catalog'];

export const catalogQuery = () => orpc.automations.catalog.queryOptions({ staleTime: 60_000 });

export const automationQuery = (id: string) => orpc.automations.get.queryOptions({ input: { id } });

/** The newest runs and how many there are, polled: the Runs tab counts what its list shows. */
export const runsQuery = (id: string) =>
  orpc.automations.runs.queryOptions({ input: { id, limit: 50 }, refetchInterval: 5000 });
