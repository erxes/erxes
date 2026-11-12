import { type ContentType, companies, customers, type Db } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { type Actor, userCaller, type Caller } from '~/http/auth';
import { type Changes, diffCustomFields, diffFields, mergeChanges } from '~/lib/changes';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { notify } from '~/modules/notifications/notifications.service';
import { moveActivities, recordActivity, removeActivities } from './activities.service';
import { currentImport } from '~/lib/causation';

/**
 * What a customer or company change leaves behind, written in the same
 * transaction as the change:
 * - the record's timeline (`core_activities`), shown on its page;
 * - the audit log (`core_audit_logs`), for owners and admins;
 * - a notification when someone else makes you the owner.
 */

const NOUN = { customer: 'Customer', company: 'Company' } as const;
const PLURAL = { customer: 'Customers', company: 'Companies' } as const;

/** Tells a record's owner what someone else did to it (never the one who did it). */
const notifyOwners = async (
  tx: Db,
  actor: Actor,
  type: ContentType,
  owners: (string | null)[],
  input: {
    verb: 'updated' | 'merged' | 'deleted';
    title: string;
    body: string;
    recordId: string;
    link?: string;
    data?: Record<string, unknown>;
  },
) => {
  const userIds = [
    ...new Set(owners.filter((id): id is string => Boolean(id) && id !== actor.userId)),
  ];

  if (!userIds.length) {
    return;
  }

  await notify(tx, userCaller(actor), {
    userIds,
    kind: `core.${type}.${input.verb}`,
    title: input.title,
    body: input.body,
    link: input.link,
    entity: { type, id: input.recordId },
    data: input.data,
    // Several quick edits by one person become one notification.
    collapseMinutes: input.verb === 'updated' ? 30 : undefined,
  });
};

interface ContactRow {
  id: string;
  ownerId: string | null;
  tagIds: string[];
  customFields: Record<string, unknown>;
}

const CUSTOMER_FIELDS = [
  'state',
  'firstName',
  'middleName',
  'lastName',
  'avatarUrl',
  'primaryEmail',
  'emails',
  'primaryPhone',
  'phones',
  'sex',
  'birthDate',
  'position',
  'department',
  'code',
  'description',
  'ownerId',
] as const;

const COMPANY_FIELDS = [
  'primaryName',
  'names',
  'avatarUrl',
  'primaryEmail',
  'emails',
  'primaryPhone',
  'phones',
  'website',
  'industry',
  'size',
  'businessType',
  'code',
  'description',
  'ownerId',
] as const;

/** A readable name for a record, kept in the audit log as it was. */
export const contactLabel = (type: ContentType, row: object): string => {
  const value = row as Record<string, unknown>;

  if (type === 'company') {
    return String(value.primaryName ?? value.primaryEmail ?? value.id);
  }

  const name = [value.firstName, value.middleName, value.lastName].filter(Boolean).join(' ');

  return String(name || value.primaryEmail || value.primaryPhone || value.id);
};

const detailLink = (type: ContentType, id: string) =>
  `/contacts/${type === 'customer' ? 'customers' : 'companies'}/${encodeURIComponent(id)}`;

const notifyNewOwner = async (
  tx: Db,
  actor: Actor,
  type: ContentType,
  row: ContactRow,
  before: string | null,
) => {
  // A quiet import tells nobody about each row (the importer sees the summary).
  if (currentImport()?.quiet) return;

  if (!row.ownerId || row.ownerId === before || row.ownerId === actor.userId) {
    return;
  }

  await notify(tx, userCaller(actor), {
    userIds: [row.ownerId],
    kind: `core.${type}.assigned`,
    title: type === 'customer' ? 'A customer was assigned to you' : 'A company was assigned to you',
    body: contactLabel(type, row),
    link: detailLink(type, row.id),
    entity: { type, id: row.id },
  });
};

export const contactCreated = async (
  tx: Db,
  actor: Actor | Caller,
  type: ContentType,
  row: ContactRow,
) => {
  const caller = 'actorType' in actor ? actor : userCaller(actor);

  await recordActivity(tx, caller, { targetType: type, targetId: row.id, type: `${type}.created` });
  await publishCoreEvents(tx, caller, {
    type: `core.${type}.created`,
    subject: { type, id: row.id },
    payload: { label: contactLabel(type, row), ownerId: row.ownerId },
  });
  await recordAudit(tx, caller, {
    action: `${type}.created`,
    targetType: type,
    targetId: row.id,
    targetLabel: contactLabel(type, row),
  });

  // Created by a plugin: no owner was chosen, nobody to tell.
  if (!('actorType' in actor)) await notifyNewOwner(tx, actor, type, row, null);
};

/** Field, custom field and tag changes between two versions of a record. */
export const contactChanges = (
  type: ContentType,
  before: ContactRow,
  after: ContactRow,
): Changes | null => {
  const fields = (type === 'customer' ? CUSTOMER_FIELDS : COMPANY_FIELDS) as readonly string[];

  return mergeChanges(
    diffFields(
      before as unknown as Record<string, unknown>,
      after as unknown as Record<string, unknown>,
      fields,
    ),
    diffCustomFields(before.customFields, after.customFields),
    diffFields(before, after, ['tagIds']),
  );
};

export const contactUpdated = async (
  tx: Db,
  actor: Actor,
  type: ContentType,
  before: ContactRow,
  after: ContactRow,
) => {
  const changes = contactChanges(type, before, after);

  if (!changes) {
    return;
  }

  const caller = userCaller(actor);

  await recordActivity(tx, caller, {
    targetType: type,
    targetId: after.id,
    type: `${type}.updated`,
    data: { changes },
  });
  await publishCoreEvents(tx, caller, {
    type: `core.${type}.updated`,
    subject: { type, id: after.id },
    payload: { changes },
  });
  await recordAudit(tx, caller, {
    action: `${type}.updated`,
    targetType: type,
    targetId: after.id,
    targetLabel: contactLabel(type, after),
    changes,
  });
  await notifyNewOwner(tx, actor, type, after, before.ownerId);

  // The owner kept their record: tell them what changed (a new owner was told above).
  if (after.ownerId && after.ownerId === before.ownerId && !currentImport()?.quiet) {
    await notifyOwners(tx, actor, type, [after.ownerId], {
      verb: 'updated',
      title: `${NOUN[type]} updated`,
      body: contactLabel(type, after),
      recordId: after.id,
      link: detailLink(type, after.id),
      data: { changes },
    });
  }
};

export const contactsRemoved = async (tx: Db, actor: Actor, type: ContentType, rows: object[]) => {
  const ids = rows.map((row) => (row as { id: string }).id);

  await removeActivities(tx, actor.orgId, type, ids);
  await publishCoreEvents(
    tx,
    userCaller(actor),
    rows.map((row) => ({
      type: `core.${type}.deleted`,
      subject: { type, id: (row as { id: string }).id },
      payload: { label: contactLabel(type, row) },
    })),
  );

  for (const row of rows as (ContactRow & object)[]) {
    await notifyOwners(tx, actor, type, [row.ownerId], {
      verb: 'deleted',
      title: `${NOUN[type]} deleted`,
      body: contactLabel(type, row),
      recordId: row.id,
    });
  }

  await recordAudit(
    tx,
    userCaller(actor),
    rows.map((row) => ({
      action: `${type}.deleted`,
      targetType: type,
      targetId: (row as { id: string }).id,
      targetLabel: contactLabel(type, row),
    })),
  );
};

export const contactsMerged = async (
  tx: Db,
  actor: Actor,
  type: ContentType,
  keep: ContactRow,
  others: object[],
) => {
  const caller = userCaller(actor);
  const mergedIds = others.map((other) => (other as { id: string }).id);

  await moveActivities(tx, actor.orgId, type, mergedIds, keep.id);
  await publishCoreEvents(tx, caller, {
    type: `core.${type}.merged`,
    subject: { type, id: keep.id },
    payload: { mergedIds },
  });
  await recordActivity(tx, caller, {
    targetType: type,
    targetId: keep.id,
    type: `${type}.merged`,
    data: { mergedIds, mergedNames: others.map((other) => contactLabel(type, other)) },
  });
  await notifyOwners(
    tx,
    actor,
    type,
    [keep.ownerId, ...others.map((other) => (other as ContactRow).ownerId)],
    {
      verb: 'merged',
      title: `${PLURAL[type]} merged`,
      body: `${others.map((other) => contactLabel(type, other)).join(', ')} → ${contactLabel(type, keep)}`,
      recordId: keep.id,
      link: detailLink(type, keep.id),
      data: { mergedIds },
    },
  );
  await recordAudit(tx, caller, {
    action: `${type}.merged`,
    targetType: type,
    targetId: keep.id,
    targetLabel: contactLabel(type, keep),
    metadata: { mergedIds, mergedNames: others.map((other) => contactLabel(type, other)) },
  });
};

/** Tags added or removed in bulk: one timeline entry per record that changed. */
export const contactsTagged = async (
  tx: Db,
  actor: Actor,
  type: ContentType,
  before: Map<string, string[]>,
  after: Map<string, string[]>,
) => {
  const entries = [...after].flatMap(([id, tagIds]) => {
    const previous = new Set(before.get(id) ?? []);
    const now = new Set(tagIds);
    const added = tagIds.filter((tagId) => !previous.has(tagId));
    const removed = [...previous].filter((tagId) => !now.has(tagId));

    return added.length || removed.length
      ? [{ targetType: type, targetId: id, type: `${type}.tagged`, data: { added, removed } }]
      : [];
  });

  await recordActivity(tx, userCaller(actor), entries);
  await publishCoreEvents(
    tx,
    userCaller(actor),
    entries.map((entry) => ({
      type: `core.${type}.tagged`,
      subject: { type, id: entry.targetId },
      payload: entry.data,
    })),
  );
};

/** A customer–company link, on both timelines. */
export const contactsLinked = async (
  tx: Db,
  actor: Actor,
  customerId: string,
  companyId: string,
  linked: boolean,
) => {
  const verb = linked ? 'linked' : 'unlinked';

  // Each side's name goes with the entry, so the timeline reads at once (and
  // still says who it was after a deletion).
  const [names] = await tx
    .select({
      customerName: sql<
        string | null
      >`(select coalesce(nullif(trim(concat_ws(' ', ${customers.firstName}, ${customers.lastName})), ''), ${customers.primaryEmail}, ${customers.primaryPhone}) from ${customers} where ${and(eq(customers.orgId, actor.orgId), eq(customers.id, customerId))})`,
      companyName: sql<
        string | null
      >`(select ${companies.primaryName} from ${companies} where ${and(eq(companies.orgId, actor.orgId), eq(companies.id, companyId))})`,
    })
    .from(sql`(select 1) as one`);

  await publishCoreEvents(tx, userCaller(actor), {
    type: `core.customer.company_${verb}`,
    subject: { type: 'customer', id: customerId },
    payload: { customerId, companyId },
  });

  await recordActivity(tx, userCaller(actor), [
    {
      targetType: 'customer',
      targetId: customerId,
      type: `customer.company_${verb}`,
      data: { companyId, companyName: names?.companyName ?? null },
    },
    {
      targetType: 'company',
      targetId: companyId,
      type: `company.customer_${verb}`,
      data: { customerId, customerName: names?.customerName ?? null },
    },
  ]);
};
