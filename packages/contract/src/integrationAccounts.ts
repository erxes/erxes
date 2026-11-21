import { INTEGRATION_CATEGORIES } from '@erxes/core-db/integrationEnums';
import { integrationAccounts, integrationSetups } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { IntegrationDataKey, IntegrationKey } from './integrationValues';
import {
  INTEGRATION_ACCOUNT_MAX,
  INTEGRATION_CANDIDATE_MAX,
  IntegrationAccountKind,
  IntegrationCandidate,
  IntegrationConnect,
  IntegrationFormValues,
  IntegrationRef,
  IntegrationSetupForm,
} from './pluginIntegrations';

export const INTEGRATION_PICK_MINUTES = 15;

export const INTEGRATION_USAGE_MAX = 50;

export const integrationAccountRefinements = {
  id: Id,
  sealedNames: () => z.array(z.string()),
  config: () => z.record(z.string(), z.unknown()),
  checkedAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
};

export const IntegrationAccount = createSelectSchema(
  integrationAccounts,
  integrationAccountRefinements,
).pick({
  id: true,
  integration: true,
  kind: true,
  externalId: true,
  name: true,
  detail: true,
  sealedNames: true,
  status: true,
  error: true,
  checkedAt: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type IntegrationAccount = z.infer<typeof IntegrationAccount>;

export const IntegrationAccountChoice = IntegrationAccount.pick({
  id: true,
  kind: true,
  name: true,
  detail: true,
  status: true,
});

export type IntegrationAccountChoice = z.infer<typeof IntegrationAccountChoice>;

export const IntegrationDefinition = z.object({
  key: IntegrationRef,
  plugin: z.string(),
  name: z.string(),
  summary: z.string(),
  category: z.enum(INTEGRATION_CATEGORIES),
  countries: z.array(z.string()),
  accounts: z.array(IntegrationAccountKind),
  connect: IntegrationConnect,
  pick: z.boolean(),
  setup: IntegrationSetupForm.nullable(),
  checks: z.boolean(),
  accountCount: z.int(),
  brokenCount: z.int(),
});

export type IntegrationDefinition = z.infer<typeof IntegrationDefinition>;

export const IntegrationSetup = createSelectSchema(integrationSetups, {
  values: () => z.record(z.string(), z.unknown()),
  sealedNames: () => z.array(z.string()),
  updatedAt: isoDate,
})
  .pick({ integration: true, values: true, sealedNames: true, updatedAt: true })
  .extend({ updatedAt: isoDate().nullable() });

export type IntegrationSetup = z.infer<typeof IntegrationSetup>;

const ConnectFailure = z.object({ name: z.string(), message: z.string() });

export const IntegrationConnectResult = z.object({
  pickId: Id.nullable(),
  connected: z.array(IntegrationAccount).max(INTEGRATION_CANDIDATE_MAX),
  failed: z.array(ConnectFailure).max(INTEGRATION_CANDIDATE_MAX),
});

export type IntegrationConnectResult = z.infer<typeof IntegrationConnectResult>;

const PickCandidate = IntegrationCandidate.pick({
  kind: true,
  externalId: true,
  name: true,
  detail: true,
}).extend({ connected: z.boolean() });

export const IntegrationPick = z.object({
  id: Id,
  integration: IntegrationRef,
  expiresAt: isoDate(),
  candidates: z.array(PickCandidate).max(INTEGRATION_CANDIDATE_MAX),
});

export type IntegrationPick = z.infer<typeof IntegrationPick>;

const Chosen = IntegrationCandidate.pick({ kind: true, externalId: true });

const { LIMIT_EXCEEDED, INTEGRATION_REFUSED, PLUGIN_UNREACHABLE, PICK_EXPIRED, INVALID_TYPE } =
  ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  LIMIT_EXCEEDED,
  INTEGRATION_REFUSED,
  PLUGIN_UNREACHABLE,
  PICK_EXPIRED,
  INVALID_TYPE,
});

const ok = z.object({ ok: z.literal(true) });

export const IntegrationAccountName = z.string().trim().min(1).max(200);

const CustomSecrets = z.record(IntegrationDataKey, z.string().min(1).max(4000).nullable());

export const integrationAccountsContract = {
  definitions: base
    .route({
      method: 'GET',
      path: '/integration-definitions',
      summary:
        "The installed plugins' integrations the member may manage, with how many accounts each has and how many need reconnecting",
    })
    .input(z.object({}))
    .output(listOf(IntegrationDefinition)),
  list: base
    .route({
      method: 'GET',
      path: '/integration-accounts',
      summary: `An integration's accounts by name (at most ${INTEGRATION_ACCOUNT_MAX}); no secret is returned`,
    })
    .input(z.object({ integration: IntegrationRef }))
    .output(z.object({ data: z.array(IntegrationAccount).max(INTEGRATION_ACCOUNT_MAX) })),
  choices: base
    .route({
      method: 'GET',
      path: '/integration-accounts/choices',
      summary: `The accounts an automation step or condition picks from (at most ${INTEGRATION_ACCOUNT_MAX})`,
    })
    .input(z.object({ integration: IntegrationRef, kind: IntegrationKey.optional() }))
    .output(z.object({ data: z.array(IntegrationAccountChoice).max(INTEGRATION_ACCOUNT_MAX) })),
  start: base
    .route({
      method: 'POST',
      path: '/integration-accounts/start',
      summary:
        "Begin a sign-in at the service: answers the address to send the member to. 400 INTEGRATION_REFUSED with the plugin's reason, 502 PLUGIN_UNREACHABLE",
    })
    .input(z.object({ integration: IntegrationRef }))
    .output(z.object({ url: z.string() })),
  connect: base
    .route({
      method: 'POST',
      path: '/integration-accounts/connect',
      summary: `Connect with the integration's form: the accounts it connected, or the pick to choose from. 400 INTEGRATION_REFUSED with the service's reason, 400 LIMIT_EXCEEDED past ${INTEGRATION_ACCOUNT_MAX} accounts, 502 PLUGIN_UNREACHABLE`,
    })
    .input(z.object({ integration: IntegrationRef, values: IntegrationFormValues }))
    .output(IntegrationConnectResult),
  create: base
    .route({
      method: 'POST',
      path: '/integration-accounts',
      successStatus: 201,
      summary: `Add an account of a custom integration: its name and sealed values, which its programs read before the integration's own. 400 LIMIT_EXCEEDED past ${INTEGRATION_ACCOUNT_MAX} accounts`,
    })
    .input(
      z.object({
        integration: IntegrationRef,
        name: IntegrationAccountName,
        secrets: z.record(IntegrationDataKey, z.string().min(1).max(4000)),
      }),
    )
    .output(IntegrationAccount),
  setSecrets: base
    .route({
      method: 'PUT',
      path: '/integration-accounts/{id}/secrets',
      summary: "Set or remove (null) a custom integration account's sealed values by name",
    })
    .input(z.object({ id: Id, secrets: CustomSecrets }))
    .output(IntegrationAccount),
  pick: base
    .route({
      method: 'GET',
      path: '/integration-picks/{id}',
      summary: `What a sign-in found, for the member who started it, for ${INTEGRATION_PICK_MINUTES} minutes. 410 PICK_EXPIRED after`,
    })
    .input(z.object({ id: Id }))
    .output(IntegrationPick),
  confirmPick: base
    .route({
      method: 'POST',
      path: '/integration-picks/{id}/confirm',
      summary: `Connect the chosen candidates; those already connected get their new secret. Answers which connected and which the service refused. 410 PICK_EXPIRED, 400 LIMIT_EXCEEDED past ${INTEGRATION_ACCOUNT_MAX} accounts`,
    })
    .input(z.object({ id: Id, chosen: z.array(Chosen).min(1).max(INTEGRATION_CANDIDATE_MAX) }))
    .output(IntegrationConnectResult),
  cancelPick: base
    .route({
      method: 'DELETE',
      path: '/integration-picks/{id}',
      summary: 'Drop what a sign-in found without connecting',
    })
    .input(z.object({ id: Id }))
    .output(ok),
  rename: base
    .route({ method: 'PATCH', path: '/integration-accounts/{id}', summary: 'Rename an account' })
    .input(z.object({ id: Id, name: IntegrationAccountName }))
    .output(IntegrationAccount),
  check: base
    .route({
      method: 'POST',
      path: '/integration-accounts/{id}/check',
      summary:
        'Ask the service whether it still takes the account, and record the answer. 502 PLUGIN_UNREACHABLE',
    })
    .input(z.object({ id: Id }))
    .output(IntegrationAccount),
  usage: base
    .route({
      method: 'GET',
      path: '/integration-accounts/{id}/usage',
      summary: `The automations that name the account (the first ${INTEGRATION_USAGE_MAX})`,
    })
    .input(z.object({ id: Id }))
    .output(
      z.object({
        automations: z.array(z.object({ id: Id, name: z.string() })).max(INTEGRATION_USAGE_MAX),
      }),
    ),
  remove: base
    .route({
      method: 'DELETE',
      path: '/integration-accounts/{id}',
      summary: 'Remove an account and its secret; automations that name it fail',
    })
    .input(z.object({ id: Id }))
    .output(ok),
  setup: base
    .route({
      method: 'GET',
      path: '/integration-setups/{integration}',
      summary:
        "The organisation's own keys for an integration: the plain values, and the names of the sealed ones",
    })
    .input(z.object({ integration: IntegrationRef }))
    .output(IntegrationSetup),
  saveSetup: base
    .route({
      method: 'PUT',
      path: '/integration-setups/{integration}',
      summary:
        "Set the organisation's own keys for an integration. A secret left out keeps its value; null removes a value",
    })
    .input(z.object({ integration: IntegrationRef, values: IntegrationFormValues }))
    .output(IntegrationSetup),
  removeSetup: base
    .route({
      method: 'DELETE',
      path: '/integration-setups/{integration}',
      summary: "Remove the organisation's own keys for an integration",
    })
    .input(z.object({ integration: IntegrationRef }))
    .output(ok),
};
