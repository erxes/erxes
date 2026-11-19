/**
 * `notifications` → `core_notifications`, for members who are in core. Both old shapes are read:
 * 3.x (`notifType`, `content`, `receiver`) and later (`contentType`, `title`, `message`). Old
 * erxes dropped a notification when it expired, so one past its expiry, or read, comes in read:
 * members aren't handed thousands of stale unread ones, and core's retention then treats it as
 * its own read notifications. Old links point at old pages, so the record stays as the entity.
 */
import type { Document } from 'mongodb';
import { ownerOf, targetOf } from './activityKinds';
import { resolve } from './idMap';
import { eachBatch, idSet, insert, type Run } from './run';
import { createdOf, flag, idOf, optionalId, readOr, record, text, when } from './values';

const Notification = record({
  userId: optionalId,
  receiver: optionalId,
  fromUserId: optionalId,
  createdUser: optionalId,
  notifType: text,
  action: text,
  contentType: text,
  contentTypeId: text,
  title: text,
  message: text,
  content: text,
  priority: text,
  isRead: flag,
  readAt: when,
  expiresAt: when,
  date: when,
  createdAt: when,
  updatedAt: when,
});

type Notification = NonNullable<ReturnType<typeof Notification.parse>>;

/** 3.x content types had no plugin prefix. */
const BARE: Record<string, string> = {
  deal: 'sales:deal',
  task: 'tasks:task',
  ticket: 'tickets:ticket',
  conversation: 'inbox:conversation',
  customer: 'core:customer',
  company: 'core:company',
};

/** The row for a member who exists now; null for anyone else. */
export const notificationRow = (old: Notification, members: Set<string>, now: Date) => {
  const user = old.userId ?? old.receiver;
  const recipient = user && resolve('user', user);

  if (!recipient || !members.has(recipient)) return null;

  const oldType = old.contentType && (BARE[old.contentType] ?? old.contentType);
  const entityType = targetOf(oldType);

  const actor =
    (old.fromUserId ?? old.createdUser) && resolve('user', old.fromUserId ?? old.createdUser ?? '');

  const knownActor = actor && members.has(actor) ? actor : null;
  const at = createdOf(old.id, old.createdAt, old.date, old.updatedAt);
  const expired = old.expiresAt !== null && old.expiresAt < now;
  const readAt = old.readAt ?? (old.isRead || expired ? (old.updatedAt ?? at) : null);

  const kind =
    old.notifType ?? [oldType?.split(':')[1] ?? 'notice', old.action].filter(Boolean).join('.');

  return [
    old.id,
    recipient,
    entityType ? ownerOf(entityType) : 'erxes3',
    kind,
    old.title ?? old.notifType ?? 'Notification',
    old.message ?? old.content,
    entityType,
    entityType ? old.contentTypeId : null,
    old.priority === 'high' || old.priority === 'critical' ? 'high' : 'normal',
    knownActor ? 'user' : 'system',
    knownActor,
    `officenext:notification:${old.id}`,
    readAt,
    at,
    JSON.stringify({ importedFrom: 'erxes 3', oldContentType: old.contentType }),
  ];
};

const COLUMNS = [
  'id',
  'user_id',
  'source',
  'kind',
  'title',
  'body',
  'entity_type',
  'entity_id',
  'priority',
  'actor_type',
  'actor_id',
  'dedupe_key',
  'read_at',
  'created_at',
  'data',
];

const NAME = 'notifications';

/** Every member's notifications. */
export const importNotifications = async (run: Run) => {
  const members = await idSet(run, 'core_users');
  const now = new Date();

  run.report.of(NAME, 'core_notifications');

  await eachBatch(run, run.mongo.collection(NAME), async (documents: Document[]) => {
    const rows = documents.flatMap((raw) => {
      const old = readOr(Notification, raw);
      const row = old && notificationRow(old, members, now);

      if (!old) run.report.skip(NAME, 'unreadable _id', idOf(raw));
      else if (!row) run.report.skip(NAME, 'recipient is not a member in core', old.id);

      return row ? [row] : [];
    });

    await insert(run, {
      collection: NAME,
      table: 'core_notifications',
      columns: COLUMNS,
      rows,
      keys: rows.map((row) => String(row[0])),
    });
  });
};
