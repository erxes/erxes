import { appActionType } from '@erxes/core-contract';
import { withOrg } from '@erxes/core-db';
import { z } from 'zod';
import { fail } from '~/http/errors';
import type { AppAction, Integration, KeyedIntegration } from '~/modules/integrations/define';
import { GatewayError } from '~/modules/integrations/gateways/types';
import { INTEGRATIONS } from '~/modules/integrations/registry';
import { connectionKeys } from '~/modules/integrations/subscriptions';
import { type CoreAction, idempotencyKey, parseInput } from './context';

const RETRIED = new Set([408, 409, 425, 429]);

const refused = (error: unknown): error is GatewayError =>
  error instanceof GatewayError &&
  error.status !== null &&
  error.status >= 400 &&
  error.status < 500 &&
  !RETRIED.has(error.status);

const StepInput = z.looseObject({ connectionId: z.string().min(1) });

const appCall = (integration: KeyedIntegration, action: AppAction<unknown>): CoreAction => ({
  type: appActionType(integration.key, action.key),
  label: `${integration.name}: ${action.label}`,
  description: action.description,
  source: integration.key,
  subject: null,
  fields: [
    {
      key: 'connectionId',
      label: `${integration.name} connection`,
      type: 'connection',
      integration: integration.key,
      required: true,
    },
    ...action.fields,
  ],
  outputs: action.outputs ?? [],
  call: async (ctx) => {
    const { connectionId, ...input } = parseInput(ctx, StepInput);
    const keys = await withOrg(ctx.orgId, (tx) => connectionKeys(tx, integration, connectionId));

    try {
      return await action.run({ keys, input, idempotencyKey: idempotencyKey(ctx) });
    } catch (error) {
      if (refused(error)) throw fail('GATEWAY_REFUSED', error.message);

      throw error;
    }
  },
});

const isKeyed = (integration: Integration): integration is KeyedIntegration =>
  Boolean(integration.keys);

export const APP_ACTIONS: CoreAction[] = INTEGRATIONS.filter(isKeyed).flatMap((integration) =>
  (integration.actions ?? []).map((action) => appCall(integration, action)),
);
