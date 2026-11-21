/**
 * Moves accounting transactions from the old statuses to the new tiers.
 *
 * Single organization (one deploy, one database):
 *   MONGO_URL=mongodb://... npx ts-node src/migrations/migrateTransactionStatuses.ts
 *
 * SaaS (one database per organization, chosen by subdomain):
 *   VERSION=saas MONGO_URL=... CORE_MONGO_URL=... [DB_NAME=erxes_<organizationId>]
 *   [SUBDOMAIN=acme] npx ts-node src/migrations/migrateTransactionStatuses.ts
 *   Without SUBDOMAIN every organization is migrated.
 *
 * DRY_RUN=true only counts. Afterwards run "Recalculate remainders" per
 * organization: rows that left the old soon tier change live inventory.
 */
import * as dotenv from 'dotenv';
import { Collection, Db, Document, Filter, MongoClient } from 'mongodb';

export const TRANSACTIONS_COLLECTION = 'accountings_transactions';

/** Statuses the new workflow keeps as they are. */
const KEPT_STATUSES = [
  'estimated',
  'complete',
  'executing',
  'requested',
  'draft',
  'mentioned',
  'plan',
];

const hasRecipients = {
  'mentionUserIds.0': { $exists: true, $nin: [null, ''] },
};

type TStatusMigrationStep = {
  name: string;
  filter: Filter<Document>;
  status: string;
};

/**
 * Old statuses mapped to their equivalent in the new tiers.
 *
 * - The old business tier (`progress`, `assigned`, `confirmed`, `canelled`)
 *   counted as real; it becomes `estimated`, real but not yet complete, so
 *   ledgers and balances keep these rows.
 * - `approved`, `rejeced` and `returned` were actions on a request. A row in
 *   one of them goes back to the step before the action: the addressed draft
 *   (`mentioned`) when it still names recipients, otherwise the owner's
 *   `draft`.
 * - A `mentioned` row without recipients cannot be saved under the new rules,
 *   so it becomes `draft`.
 */
export const TRANSACTION_STATUS_MIGRATION_STEPS: TStatusMigrationStep[] = [
  {
    // The spec spelled the final status `completed`; the value is `complete`.
    name: 'completed-to-complete',
    filter: { status: 'completed' },
    status: 'complete',
  },
  {
    name: 'business-to-estimated',
    filter: {
      status: { $in: ['progress', 'assigned', 'confirmed', 'canelled'] },
    },
    status: 'estimated',
  },
  {
    name: 'actions-to-mentioned',
    filter: {
      status: { $in: ['approved', 'rejeced', 'returned'] },
      ...hasRecipients,
    },
    status: 'mentioned',
  },
  {
    name: 'actions-to-draft',
    filter: {
      status: { $in: ['approved', 'rejeced', 'returned'] },
      $nor: [hasRecipients],
    },
    status: 'draft',
  },
  {
    name: 'unaddressed-mentioned-to-draft',
    filter: { status: 'mentioned', $nor: [hasRecipients] },
    status: 'draft',
  },
];

/** Rows left untouched because their status is unknown to both workflows. */
export const UNKNOWN_STATUS_FILTER: Filter<Document> = {
  status: {
    $nin: [
      ...KEPT_STATUSES,
      'completed',
      'progress',
      'assigned',
      'confirmed',
      'canelled',
      'approved',
      'rejeced',
      'returned',
    ],
  },
};

export type TTransactionStatusMigrationResult = {
  steps: Record<string, number>;
  unknown: number;
};

const runStep = async (
  transactions: Collection<Document>,
  step: TStatusMigrationStep,
  dryRun: boolean,
): Promise<number> => {
  if (dryRun) {
    return transactions.countDocuments(step.filter);
  }

  const { modifiedCount } = await transactions.updateMany(step.filter, {
    $set: { status: step.status },
  });

  return modifiedCount;
};

/**
 * Migrates one tenant database. Step filters do not overlap and no step's
 * result matches another step's filter, so the steps run concurrently, a row
 * moves once and a dry run's counts match the real run. Running it again is
 * a no-op.
 */
export const migrateTransactionStatuses = async (
  transactions: Collection<Document>,
  { dryRun = false }: { dryRun?: boolean } = {},
): Promise<TTransactionStatusMigrationResult> => {
  const counts = await Promise.all(
    TRANSACTION_STATUS_MIGRATION_STEPS.map((step) =>
      runStep(transactions, step, dryRun),
    ),
  );

  return {
    steps: Object.fromEntries(
      TRANSACTION_STATUS_MIGRATION_STEPS.map((step, index) => [
        step.name,
        counts[index],
      ]),
    ),
    unknown: await transactions.countDocuments(UNKNOWN_STATUS_FILTER),
  };
};

type TTenant = { label: string; db: Db };

const getSaasTenants = async (
  client: MongoClient,
  { coreMongoUrl, dbName, subdomain }: Record<string, string | undefined>,
): Promise<TTenant[]> => {
  if (!coreMongoUrl) {
    throw new Error('CORE_MONGO_URL is required when VERSION=saas');
  }

  const coreClient = new MongoClient(coreMongoUrl);
  await coreClient.connect();

  try {
    const organizations = await coreClient
      .db()
      .collection('organizations')
      .find(subdomain ? { subdomain } : {}, {
        projection: { _id: 1, subdomain: 1 },
      })
      .toArray();

    if (subdomain && !organizations.length) {
      throw new Error(`Organization with subdomain ${subdomain} not found`);
    }

    // Same database naming as createGenerateModels in erxes-api-shared.
    return organizations.map((organization) => ({
      label: organization.subdomain,
      db: client.db(
        (dbName || 'erxes_<organizationId>').replace(
          '<organizationId>',
          String(organization._id),
        ),
      ),
    }));
  } finally {
    await coreClient.close();
  }
};

const run = async () => {
  dotenv.config();

  const {
    MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
    CORE_MONGO_URL,
    VERSION,
    DB_NAME,
    SUBDOMAIN,
    DRY_RUN,
  } = process.env;
  const dryRun = DRY_RUN === 'true';

  const client = new MongoClient(MONGO_URL);
  await client.connect();

  try {
    const tenants =
      VERSION === 'saas'
        ? await getSaasTenants(client, {
            coreMongoUrl: CORE_MONGO_URL,
            dbName: DB_NAME,
            subdomain: SUBDOMAIN,
          })
        : [{ label: client.db().databaseName, db: client.db() }];

    console.log(
      `${dryRun ? '[dry run] ' : ''}Migrating transaction statuses for ${
        tenants.length
      } organization(s)`,
    );

    // The driver's connection pool caps how many tenants run at once.
    await Promise.all(
      tenants.map(async ({ label, db }) => {
        const result = await migrateTransactionStatuses(
          db.collection(TRANSACTIONS_COLLECTION),
          { dryRun },
        );
        console.log(label, JSON.stringify(result));
      }),
    );
  } finally {
    await client.close();
  }
};

// Runs only as a script, so tests can import the migration without a database.
if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
