import * as dotenv from 'dotenv';
import {
  AnyBulkWriteOperation,
  Collection,
  Db,
  MongoClient,
  ObjectId,
} from 'mongodb';
import { getTargetDbs } from './_organizationDbs';

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
 * 3. otherwise `null` (no contact; the record is migrated).
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
 *   self-hosted:  MONGO_URL=mongodb://.../erxes npx tsx <this file>
 *   SaaS, one:    MONGO_URL=<core db> TARGET_SUBDOMAIN=<subdomain> npx tsx <this file>
 *   SaaS, all:    MONGO_URL=<core db> ALL_ORGS=true npx tsx <this file>
 *   or: tsx backend/saas-migrations/run-commands.ts --org=<subdomain> <name>
 */

const {
  CORE_MONGO_URL,
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
} = process.env;

const DRY_RUN = process.env.DRY_RUN === 'true';

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

const CUSTOMER = 'core:customer';
const COMPANY = 'core:company';

interface ITarget {
  collection: string;
  // Every content type the records were ever related as.
  contentTypes: string[];
}

const TARGETS: ITarget[] = [
  {
    collection: 'deals',
    contentTypes: ['sales:deal'],
  },
  {
    collection: 'frontline_tickets',
    contentTypes: ['frontline:ticket'],
  },
  { collection: 'operation_tasks', contentTypes: ['operation:task'] },
  { collection: 'operation_projects', contentTypes: ['operation:project'] },
  // Triages were related as tasks before they had a type of their own.
  {
    collection: 'operation_triage',
    contentTypes: ['operation:triage', 'operation:task'],
  },
  { collection: 'cars', contentTypes: ['car:car', 'cars:car'] },
];

const BATCH_SIZE = 1000;

interface IRecord {
  _id: string | ObjectId;
  customerId?: string | null;
  companyId?: string | null;
  customerIds?: string[] | null;
  companyIds?: string[] | null;
}

interface IRelationDoc {
  entities?: { contentType?: string; contentId?: string }[];
  createdAt?: Date;
}

const firstOf = (ids?: (string | null)[] | null) =>
  (ids || []).find((id): id is string => !!id) ?? null;

const countOf = (ids?: (string | null)[] | null) =>
  (ids || []).filter(Boolean).length;

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
    .sort({ createdAt: 1 })
    .toArray();

  const contactsOf = (type: string) =>
    relations.flatMap(({ entities = [] }) =>
      entities
        .filter((entity) => entity.contentType === type && entity.contentId)
        .map((entity) => entity.contentId as string),
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

const migrateTarget = async (db: Db, target: ITarget) => {
  const records: Collection<IRecord> = db.collection<IRecord>(
    target.collection,
  );
  // Records with an empty contact field (`null` matches missing too). The
  // old arrays are kept, so they do not mark a record as unmigrated.
  const query = {
    $or: [{ customerId: null }, { companyId: null }],
  };

  const stats = {
    records: 0,
    fromArrays: 0,
    fromRelations: 0,
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

    if (!record.customerId || !record.companyId) {
      if (hasArrays) {
        stats.fromArrays += 1;
        stats.droppedContacts +=
          Math.max(0, countOf(record.customerIds) - 1) +
          Math.max(0, countOf(record.companyIds) - 1);

        if (!record.customerId) {
          set.customerId = firstOf(record.customerIds);
        }

        if (!record.companyId) {
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

        if (!record.customerId) {
          set.customerId = related.customerId;
        }

        if (!record.companyId) {
          set.companyId = related.companyId;
        }
      }
    }

    operations.push({
      updateOne: {
        filter: { _id: record._id },
        update: {
          $set: set,
          // Kept for now: the old arrays still hold every contact. Uncomment
          // to remove them once every organization runs the new code.
          // $unset: { customerIds: '', companyIds: '' },
        },
      },
    });

    if (operations.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  if (!DRY_RUN) {
    // Indexes for the new fields; old ones on the arrays are dropped.
    for (const name of ['customerIds_1', 'companyIds_1']) {
      await records.dropIndex(name).catch(() => undefined);
    }

    await records.createIndex({ customerId: 1 });
    await records.createIndex({ companyId: 1 });
  }

  console.log(
    `${DRY_RUN ? '[DRY RUN]' : '[DONE]'} ${target.collection}: ` +
      `${stats.records} record(s) to migrate, ${stats.fromArrays} from ` +
      `arrays, ${stats.fromRelations} from relations; extra contacts not ` +
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

const migrateDb = async (db: Db, failed: string[], label: string) => {
  // One collection failing does not stop the others; re-running finishes it.
  for (const target of TARGETS) {
    try {
      await migrateTarget(db, target);
    } catch (error) {
      failed.push(`${label}: ${target.collection}`);
      console.error(
        `[FAILED] ${target.collection}: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  try {
    await migrateAutomationTargets(db);
  } catch (error) {
    failed.push(`${label}: automations`);
    console.error(
      `[FAILED] automations: ${error instanceof Error ? error.message : error}`,
    );
  }
};

const command = async () => {
  await client.connect();

  console.log(
    `Process start at: ${new Date().toISOString()}${
      DRY_RUN ? ' (dry run)' : ''
    }`,
  );

  const failed: string[] = [];

  for (const { label, db } of await getTargetDbs(client)) {
    console.log(`\n== ${label}`);
    await migrateDb(db, failed, label);
  }

  if (failed.length) {
    console.error(`\nFailed:\n  ${failed.join('\n  ')}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit(failed.length ? 1 : 0);
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
