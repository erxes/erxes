import type { AutomationRun, coreContract } from '@erxes/core-contract';
import type { InferContractRouterOutputs } from '@orpc/contract';
import { orpc } from '@erxes/core-contract/client';
import { liveOptions } from '~/lib/live';

/** Triggers and actions: core's and installed plugins'. */
export type Catalog = InferContractRouterOutputs<typeof coreContract>['automations']['catalog'];

export const catalogQuery = () =>
  orpc.automations.catalog.queryOptions({
    staleTime: 60_000,
    ...liveOptions(['automations.catalog']),
  });

export const automationQuery = (id: string) =>
  orpc.automations.get.queryOptions({
    input: { id },
    ...liveOptions([`automations.runs:${id}`], false),
  });

export const automationsQuery = () => orpc.automations.list.queryOptions({ input: {} });

/** The newest runs and how many there are: the Runs tab counts what its list shows. */
export const runsQuery = (id: string) =>
  orpc.automations.runs.queryOptions({
    input: { id, limit: 50 },
    ...liveOptions([`automations.runs:${id}`], 5000),
  });

export const statsQuery = (id: string) =>
  orpc.automations.stats.queryOptions({
    input: { id },
    ...liveOptions([`automations.runs:${id}`], 15_000),
  });

export const runQuery = (run: Pick<AutomationRun, 'id' | 'automationId' | 'status'>) =>
  orpc.automations.run.queryOptions({
    input: { runId: run.id },
    ...liveOptions(
      [`automations.runs:${run.automationId}`],
      run.status === 'running' || run.status === 'waiting' ? 3000 : false,
    ),
  });
