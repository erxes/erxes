import { integrationAccounts } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { IntegrationAccountName, integrationAccountRefinements } from './integrationAccounts';
import { IntegrationKey } from './integrationValues';
import {
  INTEGRATION_ACCOUNT_MAX,
  INTEGRATION_CANDIDATE_MAX,
  IntegrationCandidates,
} from './pluginIntegrations';

export const PluginIntegrationAccount = createSelectSchema(
  integrationAccounts,
  integrationAccountRefinements,
).pick({
  id: true,
  integration: true,
  kind: true,
  externalId: true,
  name: true,
  detail: true,
  config: true,
  status: true,
  error: true,
  checkedAt: true,
});

export type PluginIntegrationAccount = z.infer<typeof PluginIntegrationAccount>;

const SecretValues = z.record(z.string(), z.unknown());

export const OpenIntegrationAccount = PluginIntegrationAccount.extend({
  secret: SecretValues,
  setup: SecretValues.nullable(),
});

export type OpenIntegrationAccount = z.infer<typeof OpenIntegrationAccount>;

const { LIMIT_EXCEEDED, INTEGRATION_REFUSED, PLUGIN_UNREACHABLE } = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  LIMIT_EXCEEDED,
  INTEGRATION_REFUSED,
  PLUGIN_UNREACHABLE,
});

export const pluginAccountsContract = {
  offer: base
    .route({
      method: 'POST',
      path: '/plugin/integration-accounts/offer',
      summary: `A plugin hands over what its sign-in found (at most ${INTEGRATION_CANDIDATE_MAX}) for the member who started it. Answers the address to send the member back to: the pick, or the accounts when the integration has no pick`,
    })
    .input(z.object({ integration: IntegrationKey, userId: Id, candidates: IntegrationCandidates }))
    .output(
      z.object({ url: z.string(), pickId: Id.nullable(), connected: z.int(), failed: z.int() }),
    ),
  list: base
    .route({
      method: 'GET',
      path: '/plugin/integration-accounts',
      summary: `The plugin's accounts in the organisation, without secrets (at most ${INTEGRATION_ACCOUNT_MAX} an integration)`,
    })
    .input(z.object({ integration: IntegrationKey, kind: IntegrationKey.optional() }))
    .output(z.object({ data: z.array(PluginIntegrationAccount).max(INTEGRATION_ACCOUNT_MAX) })),
  open: base
    .route({
      method: 'GET',
      path: '/plugin/integration-accounts/{id}',
      summary:
        "One of the plugin's accounts with its secret and the organisation's setup, for the plugin's server only",
    })
    .input(z.object({ id: Id }))
    .output(OpenIntegrationAccount),
  update: base
    .route({
      method: 'PATCH',
      path: '/plugin/integration-accounts/{id}',
      summary: "Change one of the plugin's accounts: its name, detail, settings or secret",
    })
    .input(
      z
        .object({
          id: Id,
          name: IntegrationAccountName.optional(),
          detail: z.string().trim().max(200).nullable().optional(),
          config: z.record(z.string(), z.unknown()).optional(),
          secret: SecretValues.optional(),
        })
        .refine((value) => Object.keys(value).some((key) => key !== 'id'), 'nothing to update'),
    )
    .output(PluginIntegrationAccount),
  report: base
    .route({
      method: 'POST',
      path: '/plugin/integration-accounts/{id}/report',
      summary:
        'A plugin says the service refused the account (why) or takes it again (null). Whoever connected an account that just broke is told',
    })
    .input(z.object({ id: Id, error: z.string().trim().min(1).max(500).nullable() }))
    .output(PluginIntegrationAccount),
  setup: base
    .route({
      method: 'GET',
      path: '/plugin/integration-setups/{integration}',
      summary:
        "The organisation's own keys for one of the plugin's integrations, sealed values included; null when none are set",
    })
    .input(z.object({ integration: IntegrationKey }))
    .output(z.object({ setup: SecretValues.nullable() })),
};
