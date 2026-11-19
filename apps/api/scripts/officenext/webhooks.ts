/**
 * Outgoing webhooks → `core_webhooks`, turned off: core signs each delivery with the endpoint's
 * secret, and an old endpoint checked erxes 3's token instead, so a member turns it on once the
 * endpoint checks core's signature. The old token becomes the signing secret, sealed with the
 * server's key. Old events (`core:customer` created) become core's event types; an endpoint with
 * none core sends is skipped.
 */
import { inOrder } from '~/lib/sequence';
import { sealed } from './gateways';
import { insert, type Run, unit } from './run';
import { mainSource, type Source, v1Source } from './sources';
import { createdOf, readOr, record, text, when } from './values';
import { z } from 'zod';

const Action = z.object({ type: z.string(), action: z.string() });

const OldWebhook = record({
  url: text,
  token: text,
  status: text,
  actions: z.unknown().optional(),
  createdAt: when,
});

type OldWebhook = NonNullable<ReturnType<typeof OldWebhook.parse>>;

const RECORDS: Record<string, string> = {
  'core:customer': 'core.customer',
  'contacts:customer': 'core.customer',
  'core:company': 'core.company',
  'contacts:company': 'core.company',
  'core:product': 'core.product',
  'products:product': 'core.product',
};

const VERBS: Record<string, string> = { create: 'created', update: 'updated', delete: 'deleted' };

/** Old events with an event in the new stack: form submissions are Frontline's. */
const OTHERS: Record<string, string> = {
  'inbox:popupSubmitted:create': 'frontline.form.submitted',
};

/** Core's event types for an old webhook's actions; unmatched ones are named. */
export const eventTypesOf = (actions: unknown) => {
  const read = (Array.isArray(actions) ? actions : []).flatMap(
    (each) => Action.safeParse(each).data ?? [],
  );

  const mapped = read.map(({ type, action }) => {
    const target = RECORDS[type];
    const verb = VERBS[action];

    return {
      old: `${type}:${action}`,
      type: OTHERS[`${type}:${action}`] ?? (target && verb ? `${target}.${verb}` : null),
    };
  });

  return {
    types: [...new Set(mapped.flatMap((each) => each.type ?? []))],
    unmatched: mapped.flatMap((each) => (each.type ? [] : [each.old])),
  };
};

const COLUMNS = [
  'id',
  'url',
  'description',
  'event_types',
  'secret_sealed',
  'status',
  'disabled_reason',
  'created_at',
];

const rowOf = (webhook: OldWebhook, url: string, types: string[], token: string) => {
  const at = createdOf(webhook.id, webhook.createdAt);

  return [
    webhook.id,
    url,
    'From old erxes',
    types,
    sealed(token),
    'disabled',
    "From old erxes: turn it on once the endpoint checks core's signature",
    at,
  ];
};

const fromSource = async (run: Run, source: Source) => {
  const { name } = source;

  const webhooks = (
    await source.db
      .collection(source.collection)
      .find(source.filter, { limit: run.limit })
      .toArray()
  ).flatMap((raw) => readOr(OldWebhook, raw) ?? []);

  run.report.of(name, 'core_webhooks');
  run.report.seen(name, webhooks.length);

  const kept = webhooks.flatMap((webhook) => {
    const { types, unmatched } = eventTypesOf(webhook.actions);

    if (unmatched.length) {
      run.report.note(name, `no core event for ${unmatched.join(', ')}`, webhook.id);
    }

    if (!webhook.url || !webhook.token || !types.length) {
      run.report.skip(
        name,
        types.length ? 'no address or token' : 'no event core sends',
        webhook.id,
      );

      return [];
    }

    return [rowOf(webhook, webhook.url, types, webhook.token)];
  });

  await unit(run, () =>
    insert(run, {
      collection: name,
      table: 'core_webhooks',
      columns: COLUMNS,
      rows: kept,
      keys: kept.map((row) => String(row[0])),
    }),
  );
};

/** `erxes`'s webhooks, and those only the v1 copy has. */
export const importWebhooks = async (run: Run) => {
  await inOrder([mainSource(run, 'webhooks'), await v1Source(run, 'webhooks')], (source) =>
    fromSource(run, source),
  );
};
