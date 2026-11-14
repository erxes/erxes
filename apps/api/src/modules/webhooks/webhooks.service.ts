import type { WEBHOOK_STATUSES } from '@erxes/core-db/enums';
import { CORE_EVENT_TYPES, type EventTypeInfo } from '@erxes/core-contract';
import { caller, type Db, newId, pluginInstallations, plugins, webhooks } from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { HttpError, notFound } from '~/http/errors';
import { newSigningSecret } from '~/lib/crypto';
import { assertOutboundUrl, OutboundError } from '~/lib/outbound';
import { oneRow } from '~/lib/rows';
import { seal } from '~/lib/secrets';
import { recordAudit } from '~/modules/audit/audit.service';

/** Core's events and those of the plugins installed here. */
export const eventTypeCatalog = async (client: Db): Promise<EventTypeInfo[]> => {
  const installed = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(pluginInstallations.status, 'active'), eq(plugins.status, 'active')));

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

export const findWebhook = async (client: Db, id: string) => {
  const [row] = await client.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);

  if (!row) throw notFound('Webhook');

  return row;
};

export const listWebhooks = async (client: Db) => ({
  data: await wholeList((limit) =>
    client.select().from(webhooks).orderBy(desc(webhooks.createdAt)).limit(limit),
  ),
});

export const createWebhook = async (
  client: Db,
  input: { url: string; description?: string | null; eventTypes: string[] },
) => {
  checkUrl(input.url);

  const secret = newSigningSecret();

  const row = oneRow(
    await client
      .insert(webhooks)
      .values({
        id: newId(),
        url: input.url,
        description: input.description ?? null,
        eventTypes: [...new Set(input.eventTypes)],
        secretSealed: seal(secret),
        createdBy: caller('user').userId,
      })
      .returning(),
  );

  await recordAudit(client, {
    action: 'webhook.created',
    targetType: 'webhook',
    targetId: row.id,
    targetLabel: row.url,
    metadata: { eventTypes: row.eventTypes },
  });

  return { webhook: row, secret };
};

const statusChange = (status: (typeof WEBHOOK_STATUSES)[number] | undefined) =>
  status
    ? {
        status,
        disabledReason: status === 'disabled' ? 'Turned off by a member' : null,
        consecutiveFailures: status === 'active' ? 0 : undefined,
      }
    : {};

export const updateWebhook = async (
  client: Db,
  id: string,
  input: {
    url?: string;
    description?: string | null;
    eventTypes?: string[];
    status?: (typeof WEBHOOK_STATUSES)[number];
  },
) => {
  const before = await findWebhook(client, id);

  if (input.url) checkUrl(input.url);

  const row = oneRow(
    await client
      .update(webhooks)
      .set({
        url: input.url,
        description: input.description,
        eventTypes: input.eventTypes && [...new Set(input.eventTypes)],
        ...statusChange(input.status),
        updatedAt: sql`now()`,
      })
      .where(eq(webhooks.id, id))
      .returning(),
  );

  await recordAudit(client, {
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

  return row;
};

export const removeWebhook = async (client: Db, id: string) => {
  const row = await findWebhook(client, id);

  await client.delete(webhooks).where(eq(webhooks.id, id));
  await recordAudit(client, {
    action: 'webhook.deleted',
    targetType: 'webhook',
    targetId: id,
    targetLabel: row.url,
  });

  return { ok: true as const };
};

export const rotateWebhookSecret = async (client: Db, id: string) => {
  const row = await findWebhook(client, id);
  const secret = newSigningSecret();

  await client
    .update(webhooks)
    .set({ secretSealed: seal(secret), updatedAt: sql`now()` })
    .where(eq(webhooks.id, id));
  await recordAudit(client, {
    action: 'webhook.secret_rotated',
    targetType: 'webhook',
    targetId: id,
    targetLabel: row.url,
  });

  return { secret };
};
