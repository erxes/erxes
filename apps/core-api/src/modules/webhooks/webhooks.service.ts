import { CORE_EVENT_TYPES, type EventTypeInfo, type Webhook } from '@erxes/core-contract';
import { type Db, newId, pluginInstallations, plugins, webhooks } from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { assertOutboundUrl, OutboundError } from '~/lib/outbound';
import { oneRow } from '~/lib/rows';
import { seal } from '~/lib/secrets';
import { recordAudit } from '~/modules/audit/audit.service';

type WebhookRow = typeof webhooks.$inferSelect;

const toWebhookDto = (row: WebhookRow): Webhook => ({
  id: row.id,
  url: row.url,
  description: row.description,
  eventTypes: row.eventTypes,
  status: row.status,
  disabledReason: row.disabledReason,
  consecutiveFailures: row.consecutiveFailures,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

/** Core's events and those of the plugins installed here. */
export const eventTypeCatalog = async (client: Db, orgId: string): Promise<EventTypeInfo[]> => {
  const installed = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(pluginInstallations.orgId, orgId),
        eq(pluginInstallations.status, 'active'),
        eq(plugins.status, 'active'),
      ),
    );

  return [
    ...CORE_EVENT_TYPES.map((item) => ({
      type: item.type,
      label: item.label,
      description: item.description,
      source: 'core',
      subject: item.subject,
    })),
    ...installed.flatMap((plugin) =>
      (plugin.manifest?.events ?? []).map((item) => ({
        type: item.type,
        label: item.label,
        description: item.description ?? null,
        source: plugin.name,
        subject: item.subject ?? null,
      })),
    ),
  ];
};

/** Does `type` match a subscription pattern (`x.y.z`, `x.*`, `*`)? */
export const matchesPattern = (pattern: string, type: string) =>
  pattern === '*' ||
  pattern === type ||
  (pattern.endsWith('.*') && type.startsWith(pattern.slice(0, -1)));

const newSecret = () => `whsec_${randomBytes(24).toString('base64url')}`;

const checkUrl = (url: string) => {
  try {
    assertOutboundUrl(url);
  } catch (error) {
    throw new HttpError(
      400,
      'INVALID_URL',
      error instanceof OutboundError ? error.message : 'Not a valid address',
    );
  }
};

export const findWebhook = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.orgId, orgId), eq(webhooks.id, id)))
    .limit(1);

  if (!row) throw notFound('Webhook');

  return row;
};

export const listWebhooks = async (client: Db, actor: Actor) => ({
  data: (
    await client
      .select()
      .from(webhooks)
      .where(eq(webhooks.orgId, actor.orgId))
      .orderBy(desc(webhooks.createdAt))
  ).map(toWebhookDto),
});

export const createWebhook = async (
  client: Db,
  actor: Actor,
  input: { url: string; description?: string | null; eventTypes: string[] },
) => {
  checkUrl(input.url);

  const secret = newSecret();

  const row = oneRow(
    await client
      .insert(webhooks)
      .values({
        id: newId(),
        orgId: actor.orgId,
        url: input.url,
        description: input.description ?? null,
        eventTypes: [...new Set(input.eventTypes)],
        secretSealed: seal(secret),
        createdBy: actor.userId,
      })
      .returning(),
  );

  await recordAudit(client, userCaller(actor), {
    action: 'webhook.created',
    targetType: 'webhook',
    targetId: row.id,
    targetLabel: row.url,
    metadata: { eventTypes: row.eventTypes },
  });

  return { webhook: toWebhookDto(row), secret };
};

const statusChange = (status: 'active' | 'disabled' | undefined) =>
  status
    ? {
        status,
        disabledReason: status === 'disabled' ? 'Turned off by a member' : null,
        ...(status === 'active' ? { consecutiveFailures: 0 } : {}),
      }
    : {};

export const updateWebhook = async (
  client: Db,
  actor: Actor,
  id: string,
  input: {
    url?: string;
    description?: string | null;
    eventTypes?: string[];
    status?: 'active' | 'disabled';
  },
) => {
  const before = await findWebhook(client, actor.orgId, id);

  if (input.url) checkUrl(input.url);

  const row = oneRow(
    await client
      .update(webhooks)
      .set({
        ...(input.url !== undefined ? { url: input.url } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.eventTypes ? { eventTypes: [...new Set(input.eventTypes)] } : {}),
        ...statusChange(input.status),
        updatedAt: sql`now()`,
      })
      .where(and(eq(webhooks.orgId, actor.orgId), eq(webhooks.id, id)))
      .returning(),
  );

  await recordAudit(client, userCaller(actor), {
    action: 'webhook.updated',
    targetType: 'webhook',
    targetId: id,
    targetLabel: row.url,
    changes: {
      ...(input.url !== undefined && input.url !== before.url
        ? { url: [before.url, input.url] }
        : {}),
      ...(input.eventTypes ? { eventTypes: [before.eventTypes, row.eventTypes] } : {}),
      ...(input.status && input.status !== before.status
        ? { status: [before.status, input.status] }
        : {}),
    },
  });

  return toWebhookDto(row);
};

export const removeWebhook = async (client: Db, actor: Actor, id: string) => {
  const row = await findWebhook(client, actor.orgId, id);

  await client.delete(webhooks).where(and(eq(webhooks.orgId, actor.orgId), eq(webhooks.id, id)));
  await recordAudit(client, userCaller(actor), {
    action: 'webhook.deleted',
    targetType: 'webhook',
    targetId: id,
    targetLabel: row.url,
  });

  return { ok: true as const };
};

export const rotateWebhookSecret = async (client: Db, actor: Actor, id: string) => {
  const row = await findWebhook(client, actor.orgId, id);
  const secret = newSecret();

  await client
    .update(webhooks)
    .set({ secretSealed: seal(secret), updatedAt: sql`now()` })
    .where(eq(webhooks.id, id));
  await recordAudit(client, userCaller(actor), {
    action: 'webhook.secret_rotated',
    targetType: 'webhook',
    targetId: id,
    targetLabel: row.url,
  });

  return { secret };
};
