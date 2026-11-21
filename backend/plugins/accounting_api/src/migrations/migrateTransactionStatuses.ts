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
import { Db, MongoClient } from 'mongodb';
import {
  migrateTransactionStatuses,
  TRANSACTIONS_COLLECTION,
} from './transactionStatusMigration';

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

type TTenant = { label: string; db: Db };

const getSaasTenants = async (client: MongoClient): Promise<TTenant[]> => {
  if (!CORE_MONGO_URL) {
    throw new Error('CORE_MONGO_URL is required when VERSION=saas');
  }

  const coreClient = new MongoClient(CORE_MONGO_URL);
  await coreClient.connect();

  try {
    const organizations = await coreClient
      .db()
      .collection('organizations')
      .find(SUBDOMAIN ? { subdomain: SUBDOMAIN } : {}, {
        projection: { _id: 1, subdomain: 1 },
      })
      .toArray();

    if (SUBDOMAIN && !organizations.length) {
      throw new Error(`Organization with subdomain ${SUBDOMAIN} not found`);
    }

    // Same database naming as createGenerateModels in erxes-api-shared.
    return organizations.map((organization) => ({
      label: organization.subdomain,
      db: client.db(
        (DB_NAME || 'erxes_<organizationId>').replace(
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
  const client = new MongoClient(MONGO_URL);
  await client.connect();

  try {
    const tenants =
      VERSION === 'saas'
        ? await getSaasTenants(client)
        : [{ label: client.db().databaseName, db: client.db() }];

    console.log(
      `${dryRun ? '[dry run] ' : ''}Migrating transaction statuses for ${
        tenants.length
      } organization(s)`,
    );

    for (const { label, db } of tenants) {
      const result = await migrateTransactionStatuses(
        db.collection(TRANSACTIONS_COLLECTION),
        { dryRun },
      );
      console.log(label, JSON.stringify(result));
    }
  } finally {
    await client.close();
  }
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
