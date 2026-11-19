/**
 * Old email campaigns (`broadcast_engage_messages`, which holds every `engage_messages` one too)
 * → `core_broadcasts`, as history. A campaign that ran (or has mail events) comes in `sent`, at
 * its last run; one that never ran comes in `cancelled`, so nothing sends to an audience core can't rebuild (members copy
 * it to send). Auto campaigns ran on a schedule; core broadcasts send once, so they keep their last
 * run. The HTML body becomes text, which core's markdown shows as it was written. Messenger and
 * app notices are other channels. `erxes_office_engages` adds the campaigns `erxes` lacks.
 */
import type { Db } from 'mongodb';
import { z } from 'zod';
import { resolve } from './idMap';
import { noteText } from './notes';
import { existing, idSet, insert, type Run, unit } from './run';
import { amount, createdOf, email, ids, optionalId, readOr, record, text, when } from './values';

const Campaign = record({
  title: text,
  method: text,
  kind: text,
  isDraft: z.boolean().nullish(),
  lastRunAt: when,
  runCount: amount,
  segmentIds: ids,
  totalCustomersCount: amount,
  validCustomersCount: amount,
  email: z
    .object({ subject: text, sender: text, replyTo: text, content: text })
    .partial()
    .nullish(),
  createdBy: optionalId,
  fromUserId: optionalId,
  createdAt: when,
  updatedAt: when,
});

type Campaign = NonNullable<ReturnType<typeof Campaign.parse>>;

const OTHER_CHANNELS: Record<string, string> = {
  messenger: 'plugin:frontline (messenger campaign)',
  notification: 'app notice campaign: core has no such channel',
};

const BODY_MAX = 50_000;

const cut = (value: string | null | undefined, max: number) => value?.trim().slice(0, max) || null;

/** The broadcast row, or why the campaign stays out. */
export const broadcastOf = (
  old: Campaign,
  context: { members: Set<string>; views: Set<string>; mailed: Set<string> },
) => {
  if (old.method !== 'email') return { skip: OTHER_CHANNELS[old.method ?? ''] ?? 'no channel' };

  const ran = old.lastRunAt !== null || (old.runCount ?? 0) > 0 || context.mailed.has(old.id);

  const maker = [old.createdBy, old.fromUserId]
    .map((id) => id && resolve('user', id))
    .find((id) => id && context.members.has(id));

  const view = old.segmentIds.length === 1 ? old.segmentIds[0] : undefined;
  const at = createdOf(old.id, old.createdAt);
  const sentAt = old.lastRunAt ?? old.updatedAt ?? at;

  return {
    row: [
      old.id,
      cut(old.title, 120) ?? 'Campaign',
      'email',
      ran ? 'sent' : 'cancelled',
      view && context.views.has(view) ? view : null,
      cut(old.email?.subject, 200),
      noteText(old.email?.content).slice(0, BODY_MAX),
      cut(old.email?.sender, 80),
      email(old.email?.replyTo ?? null),
      ran ? sentAt : null,
      ran ? sentAt : null,
      ran ? Math.round(old.validCustomersCount ?? old.totalCustomersCount ?? 0) : 0,
      maker ?? null,
      at,
      old.updatedAt ?? at,
    ],
    ran,
    auto: old.kind === 'auto',
  };
};

const COLUMNS = [
  'id',
  'name',
  'channel',
  'status',
  'view_id',
  'subject',
  'body',
  'from_name',
  'reply_to',
  'started_at',
  'finished_at',
  'total',
  'created_by',
  'created_at',
  'updated_at',
];

const importFrom = async (
  run: Run,
  db: Db,
  collection: string,
  known: { skipIds: Set<string>; mailed: Set<string> },
) => {
  const name = db === run.mongo ? collection : `${db.databaseName}.${collection}`;

  const campaigns = (
    await db.collection(collection).find({}, { limit: run.limit }).toArray()
  ).flatMap((raw) => readOr(Campaign, raw) ?? []);

  const context = {
    members: await idSet(run, 'core_users'),
    views: await existing(
      run,
      'core_views',
      campaigns.flatMap((campaign) => campaign.segmentIds),
    ),
    mailed: known.mailed,
  };

  run.report.of(name, 'core_broadcasts');
  run.report.seen(name, campaigns.length);

  const rows = campaigns.flatMap((campaign) => {
    if (known.skipIds.has(campaign.id)) {
      run.report.skip(name, 'same campaign as in broadcast_engage_messages', campaign.id);

      return [];
    }

    const placed = broadcastOf(campaign, context);

    if (placed.skip !== undefined) {
      run.report.skip(name, placed.skip, campaign.id);

      return [];
    }

    if (!placed.ran) run.report.note(name, 'never ran: comes in cancelled', campaign.id);
    else if (placed.auto) run.report.note(name, 'auto campaign: keeps its last run', campaign.id);

    return [placed.row];
  });

  await unit(run, () =>
    insert(run, {
      collection: name,
      table: 'core_broadcasts',
      columns: COLUMNS,
      rows,
      keys: rows.map((row) => String(row[0])),
    }),
  );

  return new Set(campaigns.map((campaign) => campaign.id));
};

/** Campaigns with mail events: they sent, whatever their run fields say. */
const mailedIds = async (run: Run) => {
  const lists = await Promise.all([
    run.mongo.collection('broadcast_delivery_reports').distinct('engageMessageId'),
    run.mongo.collection('broadcast_recipients').distinct('engageMessageId'),
    run.other('erxes_office_engages').collection('delivery_reports').distinct('engageMessageId'),
  ]);

  return new Set(lists.flat().filter((id) => typeof id === 'string'));
};

/** Every old email campaign, once. */
export const importBroadcasts = async (run: Run) => {
  const mailed = await mailedIds(run);

  const skipIds = await importFrom(run, run.mongo, 'broadcast_engage_messages', {
    skipIds: new Set(),
    mailed,
  });

  await importFrom(run, run.mongo, 'engage_messages', { skipIds, mailed });
  await importFrom(run, run.other('erxes_office_engages'), 'engage_messages', { skipIds, mailed });
};
