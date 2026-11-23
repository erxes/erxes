import type { coreContract } from '@erxes/core-contract';
import { requestOrgId, withOrg } from '@erxes/core-db';
import type { InferContractRouterInputs } from '@orpc/contract';
import { GatewayError } from '@erxes/plugin-sdk/integrations';
import { fail } from '~/http/errors';
import { connectionFor } from './actions';
import { connectable } from './connectable';
import { clientOf } from './connections';

const MOST = 200;

/**
 * The app's records of `recordType` for a builder picker, read with the connection the input
 * names, else the default one, the ones whose name holds `search` first 200. A type the app
 * doesn't list answers none: those are picked from the run's values. The service's refusal comes
 * back in its own words (400 GATEWAY_REFUSED).
 */
export const listAppRecords = async (
  input: InferContractRouterInputs<typeof coreContract>['integrations']['records'],
) => {
  const integration = connectable(input.key);
  const search = input.search?.toLowerCase() ?? '';

  const records = Object.entries(integration.records ?? {}).find(
    ([type]) => type === input.recordType,
  )?.[1];

  if (!records) return { data: [] };

  const client = await withOrg(requestOrgId(), async (tx) =>
    clientOf(tx, integration, await connectionFor(tx, integration, input.connection)),
  );

  try {
    const listed = await records.list({ client, parents: input.parents ?? [], search });

    return {
      data: listed.filter((item) => item.label.toLowerCase().includes(search)).slice(0, MOST),
    };
  } catch (error) {
    if (error instanceof GatewayError) throw fail('GATEWAY_REFUSED', error.message);

    throw error;
  }
};
