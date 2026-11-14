import { type ContentType, companies, customers, type Db } from '@erxes/core-db';
import { inArray, sql } from 'drizzle-orm';
import { type Actor, userCaller, type Caller } from '~/http/auth';
import { currentImport } from '~/lib/causation';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { notify } from '~/modules/notifications/notifications.service';
import { newOwnerNotice, ownerNotice } from './contactNotices';
import { moveActivities, recordActivity, removeActivities } from './activities.service';
import {
  contactChanges,
  contactLabel,
  type ContactRecord,
  type ContactRow,
  detailLink,
} from './contactRecords';

/**
 * What a customer or company change leaves behind, written in the same
 * transaction as the change:
 * - the record's timeline (`core_activities`), shown on its page;
 * - the audit log (`core_audit_logs`), for owners and admins;
 * - a notification when someone else makes you the owner.
 */

const NOUN = { customer: 'Customer', company: 'Company' } as const;
const PLURAL = { customer: 'Customers', company: 'Companies' } as const;

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
  if (!('actorType' in actor))
    await notify(tx, userCaller(actor), newOwnerNotice(actor, type, row, null));
};

/** Records changed at once (bulk lead conversion): every timeline entry, event, audit entry and notification in one write each. */
export const contactsUpdated = async (
  tx: Db,
  actor: Actor | Caller,
  type: ContentType,
  versions: { before: ContactRow; after: ContactRow }[],
) => {
  const changed = versions.flatMap(({ before, after }) => {
    const changes = contactChanges(type, before, after);

    return changes ? [{ before, after, changes }] : [];
  });

  const caller = 'actorType' in actor ? actor : userCaller(actor);

  await recordActivity(
    tx,
    caller,
    changed.map(({ after, changes }) => ({
      targetType: type,
      targetId: after.id,
      type: `${type}.updated`,
      data: { changes },
    })),
  );
  await publishCoreEvents(
    tx,
    caller,
    changed.map(({ after, changes }) => ({
      type: `core.${type}.updated`,
      subject: { type, id: after.id },
      payload: { changes },
    })),
  );
  await recordAudit(
    tx,
    caller,
    changed.map(({ after, changes }) => ({
      action: `${type}.updated`,
      targetType: type,
      targetId: after.id,
      targetLabel: contactLabel(type, after),
      changes,
    })),
  );

  // Changed by the customer (core on their behalf): the owner sees it on the timeline.
  if ('actorType' in actor) return;

  await notify(
    tx,
    userCaller(actor),
    changed.flatMap(({ before, after, changes }) => [
      ...newOwnerNotice(actor, type, after, before.ownerId),
      // The owner kept their record: tell them what changed (a new owner is told above).
      ...(after.ownerId && after.ownerId === before.ownerId && !currentImport()?.quiet
        ? ownerNotice(actor, type, [after.ownerId], {
            verb: 'updated',
            title: `${NOUN[type]} updated`,
            body: contactLabel(type, after),
            recordId: after.id,
            link: detailLink(type, after.id),
            data: { changes },
          })
        : []),
    ]),
  );
};

export const contactUpdated = (
  tx: Db,
  actor: Actor | Caller,
  type: ContentType,
  before: ContactRow,
  after: ContactRow,
) => contactsUpdated(tx, actor, type, [{ before, after }]);

export const contactsRemoved = async (
  tx: Db,
  actor: Actor,
  type: ContentType,
  rows: ContactRecord[],
) => {
  await removeActivities(
    tx,
    type,
    rows.map((row) => row.id),
  );
  await publishCoreEvents(
    tx,
    userCaller(actor),
    rows.map((row) => ({
      type: `core.${type}.deleted`,
      subject: { type, id: row.id },
      payload: { label: contactLabel(type, row) },
    })),
  );

  await notify(
    tx,
    userCaller(actor),
    rows.flatMap((row) =>
      ownerNotice(actor, type, [row.ownerId], {
        verb: 'deleted',
        title: `${NOUN[type]} deleted`,
        body: contactLabel(type, row),
        recordId: row.id,
      }),
    ),
  );

  await recordAudit(
    tx,
    userCaller(actor),
    rows.map((row) => ({
      action: `${type}.deleted`,
      targetType: type,
      targetId: row.id,
      targetLabel: contactLabel(type, row),
    })),
  );
};

export const contactsMerged = async (
  tx: Db,
  actor: Actor,
  type: ContentType,
  keep: ContactRow,
  others: ContactRecord[],
) => {
  const caller = userCaller(actor);
  const mergedIds = others.map((other) => other.id);
  const mergedNames = others.map((other) => contactLabel(type, other));

  await moveActivities(tx, type, mergedIds, keep.id);
  await publishCoreEvents(tx, caller, {
    type: `core.${type}.merged`,
    subject: { type, id: keep.id },
    payload: { mergedIds },
  });
  await recordActivity(tx, caller, {
    targetType: type,
    targetId: keep.id,
    type: `${type}.merged`,
    data: { mergedIds, mergedNames },
  });
  await notify(
    tx,
    caller,
    ownerNotice(actor, type, [keep.ownerId, ...others.map((other) => other.ownerId)], {
      verb: 'merged',
      title: `${PLURAL[type]} merged`,
      body: `${mergedNames.join(', ')} → ${contactLabel(type, keep)}`,
      recordId: keep.id,
      link: detailLink(type, keep.id),
      data: { mergedIds },
    }),
  );
  await recordAudit(tx, caller, {
    action: `${type}.merged`,
    targetType: type,
    targetId: keep.id,
    targetLabel: contactLabel(type, keep),
    metadata: { mergedIds, mergedNames },
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

/** Customer–company links, on both timelines. */
export const contactsLinked = async (
  tx: Db,
  actor: Actor,
  links: { customerId: string; companyId: string }[],
  linked: boolean,
) => {
  if (!links.length) return;

  const verb = linked ? 'linked' : 'unlinked';

  // Each side's name goes with the entry, so the timeline reads at once (and
  // still says who it was after a deletion). Ids are unique across both tables.
  const named = await tx
    .select({
      id: customers.id,
      name: sql<
        string | null
      >`coalesce(nullif(trim(concat_ws(' ', ${customers.firstName}, ${customers.lastName})), ''), ${customers.primaryEmail}, ${customers.primaryPhone})`,
    })
    .from(customers)
    .where(
      inArray(
        customers.id,
        links.map((link) => link.customerId),
      ),
    )
    .unionAll(
      tx
        .select({ id: companies.id, name: sql<string | null>`${companies.primaryName}` })
        .from(companies)
        .where(
          inArray(
            companies.id,
            links.map((link) => link.companyId),
          ),
        ),
    );

  const names = new Map(named.map((row) => [row.id, row.name]));

  await publishCoreEvents(
    tx,
    userCaller(actor),
    links.map(({ customerId, companyId }) => ({
      type: `core.customer.company_${verb}`,
      subject: { type: 'customer', id: customerId },
      payload: { customerId, companyId },
    })),
  );

  await recordActivity(
    tx,
    userCaller(actor),
    links.flatMap(({ customerId, companyId }) => [
      {
        targetType: 'customer',
        targetId: customerId,
        type: `customer.company_${verb}`,
        data: { companyId, companyName: names.get(companyId) ?? null },
      },
      {
        targetType: 'company',
        targetId: companyId,
        type: `company.customer_${verb}`,
        data: { customerId, customerName: names.get(customerId) ?? null },
      },
    ]),
  );
};
