import * as dotenv from 'dotenv';
import {
  AnyBulkWriteOperation,
  Collection,
  Db,
  MongoClient,
  ObjectId,
} from 'mongodb';

dotenv.config();

/**
 * Gives plugin records one customer and one company of their own
 * (`customerId` / `companyId`).
 *
 * For each record, in this order:
 * 1. `customerIds` / `companyIds` arrays (an earlier migration) → their first
 *    id; the arrays are kept as they are (nothing reads them any more; they
 *    still hold every contact and let old code be rolled back);
 * 2. otherwise its core relations to customers / companies, oldest first →
 *    the first one;
 * 3. deals and tickets still without a customer: the customer of the inbox
 *    conversation they were made from (conversation relations, oldest first,
 *    then the old `sourceConversationIds` field and a migrated ticket's
 *    `customerFieldData.sourceConversationIds`). Records keep no conversation
 *    link any more, so this keeps them in the customer's widgets;
 * 4. otherwise `null` (no contact; the record is migrated).
 *
 * A record with several customers or companies keeps only the first in its
 * fields; the counts are printed. The old array indexes are dropped. Relations are left in place. A field that is empty
 * (`null` or missing) is looked up again, so a record saved by new code
 * before this ran still gets its contact. Safe to run again.
 *
 * Saved automations' "set property" targets that reached a deal's or
 * ticket's customers / companies through relations ("Deal customers") are
 * rewritten to read the record's own field (`targetField` `customerId` /
 * `companyId`), as the trigger definitions now do. Create-ticket actions
 * saved with `companyIds` get `companyId` (the first / the same text).
 *
 * Run (DRY_RUN=true counts only, writes nothing):
 *   MONGO_URL=mongodb://.../erxes pnpm exec tsx backend/core-api/src/commands/migrateRelationsToContactFields.ts
 *
 * If Car is installed, also backfill car_deals. Run against the self-hosted
 * database with application writes paused.
 */

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } =
  process.env;

const DRY_RUN = process.env.DRY_RUN === 'true';

const client = new MongoClient(MONGO_URL);

const CUSTOMER = 'core:customer';
const COMPANY = 'core:company';
const CONVERSATION = 'frontline:conversation';
const DEAL = 'sales:deal';
const CAR_TYPES = ['car:car', 'cars:car'];

interface ITarget {
  collection: string;
  // Every content type the records were ever related as.
  contentTypes: string[];
  // Made from inbox conversations: falls back to the conversation's customer.
  fromConversations?: boolean;
}

const TARGETS: ITarget[] = [
  {
    collection: 'deals',
    contentTypes: [DEAL],
    fromConversations: true,
  },
  {
    collection: 'frontline_tickets',
    contentTypes: ['frontline:ticket'],
    fromConversations: true,
  },
  { collection: 'operation_tasks', contentTypes: ['operation:task'] },
  { collection: 'operation_projects', contentTypes: ['operation:project'] },
  // Triages were related as tasks before they had a type of their own.
  {
    collection: 'operation_triage',
    contentTypes: ['operation:triage', 'operation:task'],
  },
  { collection: 'cars', contentTypes: CAR_TYPES },
];

const BATCH_SIZE = 1000;

interface IRecord {
  _id: string | ObjectId;
  customerId?: string | null;
  companyId?: string | null;
  customerIds?: string[] | null;
  companyIds?: string[] | null;
  status?: string;
  sourceConversationIds?: unknown;
  customerFieldData?: { sourceConversationIds?: unknown };
}

interface IConversation {
  _id: string;
  customerId?: string | null;
}

interface IRelationDoc {
  entities?: { contentType?: string; contentId?: string }[];
  createdAt?: Date;
}

type ContactFields = Pick<IRecord, 'customerId' | 'companyId'>;
type ContactPreview = Map<string, Map<string, ContactFields>>;

interface ICarDeal {
  _id: string;
  carIds: string[];
  source: 'manual' | 'auto';
}

const firstOf = (ids?: (string | null)[] | null) =>
  (ids || []).find((id): id is string => !!id) ?? null;

const countOf = (ids?: (string | null)[] | null) =>
  (ids || []).filter(Boolean).length;

const toIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string' && !!id)
    : [];

// The record's first related customer and company, oldest relation first.
const firstRelatedContacts = async (
  db: Db,
  contentTypes: string[],
  recordId: string,
) => {
  const relations = await db
    .collection<IRelationDoc>('relations')
    .find({
      entities: {
        $elemMatch: {
          contentType: { $in: contentTypes },
          contentId: recordId,
        },
      },
      'entities.contentType': { $in: [CUSTOMER, COMPANY] },
    })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();

  const contactsOf = (type: string) =>
    relations.flatMap(({ entities = [] }) =>
      entities
        .filter((entity) => entity.contentType === type)
        .flatMap(({ contentId }) => (contentId ? [contentId] : [])),
    );
  const customers = contactsOf(CUSTOMER);
  const companies = contactsOf(COMPANY);

  return {
    customerId: customers[0] ?? null,
    companyId: companies[0] ?? null,
    extra:
      Math.max(0, new Set(customers).size - 1) +
      Math.max(0, new Set(companies).size - 1),
  };
};

// The customer of the inbox conversation the record was made from: its
// conversation relations (oldest first), then the old `sourceConversationIds`
// field and a migrated ticket's `customerFieldData.sourceConversationIds`.
// The first of those conversations that has a customer wins.
const sourceConversationCustomer = async (
  db: Db,
  contentTypes: string[],
  record: IRecord,
) => {
  const relations = await db
    .collection<IRelationDoc>('relations')
    .find({
      entities: {
        $elemMatch: {
          contentType: { $in: contentTypes },
          contentId: String(record._id),
        },
      },
      'entities.contentType': CONVERSATION,
    })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();

  const conversationIds = [
    ...new Set([
      ...relations.flatMap(({ entities = [] }) =>
        entities
          .filter((entity) => entity.contentType === CONVERSATION)
          .flatMap(({ contentId }) => (contentId ? [contentId] : [])),
      ),
      ...toIds(record.sourceConversationIds),
      ...toIds(record.customerFieldData?.sourceConversationIds),
    ]),
  ];

  if (!conversationIds.length) {
    return null;
  }

  const conversations = await db
    .collection<IConversation>('conversations')
    .find(
      { _id: { $in: conversationIds }, customerId: { $nin: [null, ''] } },
      { projection: { customerId: 1 } },
    )
    .toArray();
  const customerOf = new Map(
    conversations.map(({ _id, customerId }) => [_id, customerId]),
  );

  return conversationIds.map((id) => customerOf.get(id)).find(Boolean) ?? null;
};

const migrateTarget = async (
  db: Db,
  target: ITarget,
  preview?: ContactPreview,
) => {
  const records: Collection<IRecord> = db.collection<IRecord>(
    target.collection,
  );
  // Records with an empty contact field (`null` matches missing too). The
  // old arrays are kept, so they do not mark a record as unmigrated.
  // A null on a car is an explicit unlink made by the plugin.
  const query =
    target.collection === 'cars'
      ? {
          $or: [
            { customerId: { $exists: false } },
            { companyId: { $exists: false } },
          ],
        }
      : { $or: [{ customerId: null }, { companyId: null }] };
  const useLegacyCustomer = (record: IRecord) =>
    target.collection === 'cars'
      ? record.customerId === undefined
      : !record.customerId;
  const useLegacyCompany = (record: IRecord) =>
    target.collection === 'cars'
      ? record.companyId === undefined
      : !record.companyId;
  const changes = preview?.get(target.collection);

  const stats = {
    records: 0,
    fromArrays: 0,
    fromRelations: 0,
    fromConversations: 0,
    droppedContacts: 0,
  };
  let operations: AnyBulkWriteOperation<IRecord>[] = [];

  const flush = async () => {
    if (operations.length && !DRY_RUN) {
      await records.bulkWrite(operations, { ordered: false });
    }

    operations = [];
  };

  const cursor = records.find(query).batchSize(BATCH_SIZE);

  for await (const record of cursor) {
    stats.records += 1;

    const set: Partial<IRecord> = {};
    const hasArrays =
      Array.isArray(record.customerIds) || Array.isArray(record.companyIds);

    if (useLegacyCustomer(record) || useLegacyCompany(record)) {
      if (hasArrays) {
        stats.fromArrays += 1;
        stats.droppedContacts +=
          Math.max(0, countOf(record.customerIds) - 1) +
          Math.max(0, countOf(record.companyIds) - 1);

        if (useLegacyCustomer(record)) {
          set.customerId = firstOf(record.customerIds);
        }

        if (useLegacyCompany(record)) {
          set.companyId = firstOf(record.companyIds);
        }
      } else {
        const related = await firstRelatedContacts(
          db,
          target.contentTypes,
          String(record._id),
        );

        if (related.customerId || related.companyId) {
          stats.fromRelations += 1;
        }

        stats.droppedContacts += related.extra;

        if (useLegacyCustomer(record)) {
          set.customerId = related.customerId;
        }

        if (useLegacyCompany(record)) {
          set.companyId = related.companyId;
        }
      }

      if (
        useLegacyCustomer(record) &&
        !set.customerId &&
        target.fromConversations
      ) {
        const customerId = await sourceConversationCustomer(
          db,
          target.contentTypes,
          record,
        );

        if (customerId) {
          stats.fromConversations += 1;
          set.customerId = customerId;
        }
      }
    }

    changes?.set(String(record._id), set);
    operations.push({
      updateOne: {
        filter: { _id: record._id },
        update: { $set: set },
      },
    });

    if (operations.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  if (!DRY_RUN) {
    // Indexes for the new fields; old ones on the arrays are dropped.
    for (const { name } of await records.indexes()) {
      if (name === 'customerIds_1' || name === 'companyIds_1') {
        await records.dropIndex(name);
      }
    }

    await records.createIndex({ customerId: 1 });
    await records.createIndex({ companyId: 1 });
  }

  console.log(
    `${DRY_RUN ? '[DRY RUN]' : '[DONE]'} ${target.collection}: ` +
      `${stats.records} record(s) to migrate, ${stats.fromArrays} from ` +
      `arrays, ${stats.fromRelations} from relations, ` +
      `${stats.fromConversations} from source conversations; extra contacts not ` +
      `in the fields (still in arrays / relations): ${stats.droppedContacts}`,
  );
};

// Records whose contacts set-property targets used to reach by relation.
const CONTACT_TARGET_LABELS: Record<string, string> = {
  'sales:deal': 'Deal',
  'frontline:ticket': 'Ticket',
};

const CONTACT_TARGET_FIELDS: Record<string, 'customerId' | 'companyId'> = {
  [CUSTOMER]: 'customerId',
  [COMPANY]: 'companyId',
};

interface ISetPropertyTarget {
  label?: string;
  source?: string;
  cardinality?: string;
  relation?: { contentType?: string; relatedContentType?: string };
  targetPath?: string;
  [key: string]: unknown;
}

interface IAutomationAction {
  type?: string;
  config?: {
    setPropertyTarget?: ISetPropertyTarget;
    companyIds?: unknown;
    companyId?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface IAutomationDoc {
  _id: string | ObjectId;
  actions?: IAutomationAction[];
  workflows?: { actions?: IAutomationAction[]; [key: string]: unknown }[];
}

// The target rewritten to the record's own field, or null when unchanged.
const toFieldTarget = (
  target?: ISetPropertyTarget,
): ISetPropertyTarget | null => {
  const recordLabel =
    CONTACT_TARGET_LABELS[target?.relation?.contentType || ''];
  const field =
    CONTACT_TARGET_FIELDS[target?.relation?.relatedContentType || ''];

  if (!target || target.source !== 'relation' || !recordLabel || !field) {
    return null;
  }

  const rest: ISetPropertyTarget = { ...target };

  delete rest.relation;

  return {
    ...rest,
    label: `${recordLabel} ${field === 'customerId' ? 'customer' : 'company'}`,
    source: 'targetField',
    targetPath: field,
    cardinality: 'one',
  };
};

const migrateActions = (actions?: IAutomationAction[]) => {
  let changed = 0;

  for (const action of actions || []) {
    const { config } = action;

    if (!config) {
      continue;
    }

    const next = toFieldTarget(config.setPropertyTarget);

    if (next) {
      config.setPropertyTarget = next;
      changed += 1;
    }

    // A ticket keeps one company: its create action configures `companyId`.
    if (
      action.type?.startsWith('frontline:tickets') &&
      config.companyIds !== undefined
    ) {
      const companyIds = config.companyIds;

      if (config.companyId === undefined) {
        config.companyId = Array.isArray(companyIds)
          ? companyIds[0]
          : companyIds;
      }

      delete config.companyIds;
      changed += 1;
    }
  }

  return changed;
};

const migrateAutomationTargets = async (db: Db) => {
  const automations = db.collection<IAutomationDoc>('automations');
  const cursor = automations.find({
    $or: [
      { 'actions.config.setPropertyTarget.source': 'relation' },
      { 'workflows.actions.config.setPropertyTarget.source': 'relation' },
      { 'actions.config.companyIds': { $exists: true } },
      { 'workflows.actions.config.companyIds': { $exists: true } },
    ],
  });
  let automationCount = 0;
  let actionCount = 0;

  for await (const automation of cursor) {
    const changed =
      migrateActions(automation.actions) +
      (automation.workflows || []).reduce(
        (sum, workflow) => sum + migrateActions(workflow.actions),
        0,
      );

    if (!changed) {
      continue;
    }

    automationCount += 1;
    actionCount += changed;

    if (!DRY_RUN) {
      await automations.updateOne(
        { _id: automation._id },
        {
          $set: {
            ...(automation.actions && { actions: automation.actions }),
            ...(automation.workflows && { workflows: automation.workflows }),
          },
        },
      );
    }
  }

  console.log(
    `${DRY_RUN ? '[DRY RUN]' : '[DONE]'} automations: ${actionCount} ` +
      `action(s) in ${automationCount} automation(s) now read or set the ` +
      `record's customerId / companyId`,
  );
};

const migrateCarDeals = async (db: Db, preview?: ContactPreview) => {
  const cars = db.collection<IRecord>('cars');
  const deals = db.collection<IRecord>('deals');
  const links = db.collection<ICarDeal>('car_deals');
  const activeCars = new Set<string>();
  const carsByContact = {
    customerId: new Map<string, Set<string>>(),
    companyId: new Map<string, Set<string>>(),
  };

  for await (const car of cars.find(
    { status: { $ne: 'Deleted' } },
    { projection: { customerId: 1, companyId: 1 } },
  )) {
    const carId = String(car._id);
    activeCars.add(carId);
    const contacts = { ...car, ...preview?.get('cars')?.get(carId) };

    for (const field of ['customerId', 'companyId'] as const) {
      const contactId = contacts[field];

      if (contactId) {
        const ids = carsByContact[field].get(contactId) ?? new Set<string>();
        // Two distinct ids suffice to establish ambiguity.
        if (ids.size < 2) {
          ids.add(carId);
          carsByContact[field].set(contactId, ids);
        }
      }
    }
  }

  const directLinks = new Map<string, Set<string>>();

  for await (const relation of db.collection<IRelationDoc>('relations').find({
    $and: [
      { 'entities.contentType': DEAL },
      { 'entities.contentType': { $in: CAR_TYPES } },
    ],
  })) {
    const entities = relation.entities ?? [];
    const carIds = entities.flatMap(({ contentType, contentId }) =>
      contentType &&
      CAR_TYPES.includes(contentType) &&
      contentId &&
      activeCars.has(contentId)
        ? [contentId]
        : [],
    );

    for (const { contentType, contentId } of entities) {
      if (contentType !== DEAL || !contentId || !carIds.length) {
        continue;
      }

      const ids = directLinks.get(contentId) ?? new Set<string>();
      carIds.forEach((id) => ids.add(id));
      directLinks.set(contentId, ids);
    }
  }

  let explicit = 0;
  let automatic = 0;
  let ambiguous = 0;
  let removed = 0;
  let operations: AnyBulkWriteOperation<ICarDeal>[] = [];

  const flush = async () => {
    if (operations.length && !DRY_RUN) {
      await links.bulkWrite(operations, { ordered: false });
    }

    operations = [];
  };

  const existingLinks = new Map<string, ICarDeal>();
  for await (const link of links.find()) {
    existingLinks.set(link._id, link);
  }

  for await (const deal of deals.find(
    {},
    {
      projection: { customerId: 1, companyId: 1 },
    },
  )) {
    const dealId = String(deal._id);
    const existing = existingLinks.get(dealId);
    existingLinks.delete(dealId);

    if (existing?.source === 'manual') {
      const carIds = [...new Set(existing.carIds)].filter((id) =>
        activeCars.has(id),
      );

      if (carIds.length !== existing.carIds.length) {
        operations.push({
          updateOne: {
            filter: { _id: dealId },
            update: { $set: { carIds } },
          },
        });
      }
    } else {
      const direct = directLinks.get(dealId);
      const { customerId, companyId } = {
        ...deal,
        ...preview?.get('deals')?.get(dealId),
      };
      const candidates = new Set([
        ...(customerId ? carsByContact.customerId.get(customerId) ?? [] : []),
        ...(companyId ? carsByContact.companyId.get(companyId) ?? [] : []),
      ]);

      if (direct?.size || candidates.size === 1) {
        const source = direct?.size ? 'manual' : 'auto';
        const carIds = [...(direct?.size ? direct : candidates)].sort();
        explicit += Number(source === 'manual');
        automatic += Number(source === 'auto');
        operations.push({
          updateOne: {
            filter: { _id: dealId },
            update: { $set: { carIds, source } },
            upsert: true,
          },
        });
      } else {
        ambiguous += Number(candidates.size > 1);

        if (existing) {
          operations.push({ deleteOne: { filter: { _id: dealId } } });
          removed += 1;
        }
      }
    }

    if (operations.length >= BATCH_SIZE) {
      await flush();
    }
  }

  for (const _id of existingLinks.keys()) {
    operations.push({ deleteOne: { filter: { _id } } });
    removed += 1;

    if (operations.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  if (!DRY_RUN) {
    await links.createIndex({ carIds: 1 });
  }

  process.stdout.write(
    `${DRY_RUN ? '[DRY RUN]' : '[DONE]'} car_deals: ${explicit} explicit, ` +
      `${automatic} automatic, ${ambiguous} require selection, ${removed} stale records removed\n`,
  );
};

const command = async () => {
  try {
    await client.connect();

    const db = client.db();
    console.log(
      `[START] Connected to MongoDB database "${db.databaseName}". Starting contact fields migration${DRY_RUN ? ' (dry run)' : ''}.`,
    );

    const collections = new Set(
      (await db.listCollections({}, { nameOnly: true }).toArray()).map(
        ({ name }) => name,
      ),
    );
    const hasCarDeals = collections.has('cars') && collections.has('deals');
    const preview: ContactPreview | undefined =
      DRY_RUN && hasCarDeals
        ? new Map([
            ['cars', new Map()],
            ['deals', new Map()],
          ])
        : undefined;

    for (const target of TARGETS) {
      if (collections.has(target.collection)) {
        await migrateTarget(db, target, preview);
      }
    }

    if (hasCarDeals) {
      await migrateCarDeals(db, preview);
    }

    if (collections.has('automations')) {
      await migrateAutomationTargets(db);
    }
  } finally {
    await client.close();
  }
};

command().catch((error: unknown) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
