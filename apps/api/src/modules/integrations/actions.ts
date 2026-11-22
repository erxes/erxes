import { type Db, integrationConnections, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { type AppAction, GatewayError } from '@erxes/plugin-sdk/integrations';
import { fail } from '~/http/errors';
import {
  type CallContext,
  checked,
  type CoreAction,
  filledInput,
  idempotencyKey,
  text,
} from '~/modules/automations/actions/context';
import { getOrganization } from '~/modules/organizations/organizations.service';
import { INVOICE_ACTIONS } from '~/modules/payments/invoiceActions';
import { manages } from './connectable';
import { clientOf, connectionsWithSecret } from './connections';
import {
  CONNECTION_FIELD,
  type Integration,
  type KeyedAction,
  type KeyedIntegration,
  type PagedIntegration,
} from './define';
import { INTEGRATIONS } from './registry';

const RETRIED = new Set([408, 409, 425, 429]);

const refused = (error: unknown): error is GatewayError =>
  error instanceof GatewayError &&
  error.status !== null &&
  error.status >= 400 &&
  error.status < 500 &&
  !RETRIED.has(error.status);

const keyedAction = (action: AppAction<unknown>): KeyedAction<unknown> => ({
  key: action.key,
  label: action.label,
  description: action.description,
  outputs: action.outputs,
  subject: null,
  fields: [CONNECTION_FIELD, ...action.fields],
  async call(ctx) {
    const input = filledInput(ctx);

    checked(action.input, input);

    const { client } = await ctx.connection();

    try {
      return await action.run({ client, input, idempotencyKey: idempotencyKey(ctx) });
    } catch (error) {
      if (refused(error)) throw fail('GATEWAY_REFUSED', error.message);

      throw error;
    }
  },
});

/**
 * The connection a step runs on: the one its `connection` input names, else the organisation's
 * default gateway when it is one of the integration's, else the integration's oldest active one.
 */
const connectionFor = async (tx: Db, integration: KeyedIntegration, requested?: string) => {
  const active = await connectionsWithSecret(tx)
    .where(
      and(
        eq(integrationConnections.key, integration.key),
        eq(integrationConnections.status, 'active'),
      ),
    )
    .orderBy(integrationConnections.createdAt);

  const preferred = requested ?? (await getOrganization(tx)).defaultGatewayId;
  const row = active.find((item) => item.id === preferred) ?? (requested ? null : active[0]);

  if (!row) {
    throw fail(
      'NOT_CONNECTED',
      requested
        ? `That ${integration.name} connection is gone or turned off`
        : `${integration.name} is not connected: connect it in Settings › Integrations`,
    );
  }

  return row;
};

const open = (ctx: CallContext, integration: KeyedIntegration) =>
  withOrg(ctx.orgId, async (tx) => {
    const row = await connectionFor(tx, integration, text(ctx.input.connection));

    return { id: row.id, name: row.name, client: await clientOf(tx, integration, row) };
  });

const permitted = (
  integration: KeyedIntegration,
  action: KeyedAction<unknown>,
): KeyedAction<unknown> => ({
  ...action,
  call: (ctx) => {
    if (!manages(integration))
      throw fail(
        'NOT_ALLOWED',
        `The member who turned this automation on may no longer use ${integration.name}`,
        { permission: integration.permission },
      );

    return action.call(ctx);
  },
});

const keyedActions = (integration: KeyedIntegration): CoreAction[] => {
  const owner = { key: integration.key, name: integration.name };

  return [
    ...(integration.payments ? INVOICE_ACTIONS : []),
    ...(integration.actions ?? []).map((action) => permitted(integration, keyedAction(action))),
  ].map((action) => ({
    type: `${integration.key}.${action.key}`,
    label: action.label,
    description: action.description,
    subject: action.subject,
    fields: action.fields,
    outputs: action.outputs,
    check: action.check,
    integration: owner,
    call: (ctx) =>
      action.call({ ...ctx, integration: owner, connection: () => open(ctx, integration) }),
  }));
};

const pagedActions = (integration: PagedIntegration): CoreAction[] =>
  (integration.actions ?? []).map(({ key, ...action }) => ({
    ...action,
    type: `${integration.key}.${key}`,
    integration: { key: integration.key, name: integration.name },
  }));

const actionsOf = (integration: Integration) =>
  integration.keys ? keyedActions(integration) : pagedActions(integration);

/** What core's integrations bring to automations, as `<integration>.<action>`. */
export const INTEGRATION_ACTIONS = INTEGRATIONS.flatMap(actionsOf);

type Choices = { value: string; label: string }[];

/** Core's integrations connected here, by key, with their active connections as choices. */
export type Connections = Map<string, Choices>;

/**
 * Core's integrations connected here, each with its active connections as a `connection`
 * input's choices: a keyed one with at least one, one with its own page while it is on.
 */
export const connectedIntegrations = async (client: Db): Promise<Connections> => {
  const rows = await client
    .select({
      key: integrationConnections.key,
      id: integrationConnections.id,
      name: integrationConnections.name,
    })
    .from(integrationConnections)
    .where(eq(integrationConnections.status, 'active'))
    .orderBy(integrationConnections.createdAt);

  const choicesOf = async (integration: Integration): Promise<Choices | null> => {
    if (integration.keys) {
      const own = rows.filter((row) => row.key === integration.key);

      return own.length ? own.map((row) => ({ value: row.id, label: row.name })) : null;
    }

    if (!integration.actions?.length) return null;

    const { state } = await integration.status(client);

    return state === 'connected' || state === 'attention' ? [] : null;
  };

  const choices = await Promise.all(
    INTEGRATIONS.map(
      async (integration) => [integration.key, await choicesOf(integration)] as const,
    ),
  );

  return new Map(choices.flatMap(([key, options]) => (options ? [[key, options] as const] : [])));
};
