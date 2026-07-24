import * as dotenv from 'dotenv';
import {
  Collection,
  Db,
  Document,
  IndexDescriptionInfo,
  IndexDirection,
  MongoClient,
  ObjectId,
} from 'mongodb';

dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';
const CORE_MONGO_URL = process.env.CORE_MONGO_URL;
const VERSION = process.env.VERSION || 'os';
const DB_NAME_TEMPLATE = process.env.DB_NAME || 'erxes_<organizationId>';

type TOrganization = {
  _id: ObjectId | string;
  subdomain: string;
};

type TManagedIndex = {
  key: Record<string, IndexDirection>;
  name: string;
};

const POST_INDEXES: TManagedIndex[] = [
  {
    key: { status: 1, scheduledDate: 1 },
    name: 'status_1_scheduledDate_1',
  },
  {
    key: { status: 1, autoArchiveDate: 1 },
    name: 'status_1_autoArchiveDate_1',
  },
];

const hasKey = (
  index: Pick<IndexDescriptionInfo, 'key'>,
  expectedKey: Record<string, IndexDirection>,
) => {
  const actualKey = index.key;
  const expectedEntries = Object.entries(expectedKey);

  return (
    Object.keys(actualKey).length === expectedEntries.length &&
    expectedEntries.every(
      ([field, direction]) => actualKey[field] === direction,
    )
  );
};

const ensurePostIndexes = async (database: Db) => {
  const collections = await database
    .listCollections({ name: 'cms_posts' }, { nameOnly: true })
    .toArray();

  if (collections.length === 0) {
    return false;
  }

  const posts = database.collection('cms_posts');
  const existingIndexes = await posts.listIndexes().toArray();

  for (const index of POST_INDEXES) {
    if (!existingIndexes.some((existing) => hasKey(existing, index.key))) {
      await posts.createIndex(index.key, { name: index.name });
    }
  }

  return true;
};

const ensureOrganizationIndexes = async (
  organizations: Collection<Document>,
) => {
  const existingIndexes = await organizations.listIndexes().toArray();
  const existingSubdomainIndex = existingIndexes.find((index) =>
    hasKey(index, { subdomain: 1 }),
  );

  if (!existingSubdomainIndex?.unique) {
    const duplicate = await organizations
      .aggregate([
        { $match: { subdomain: { $type: 'string' } } },
        { $group: { _id: '$subdomain', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $limit: 1 },
      ])
      .next();

    if (duplicate) {
      throw new Error(
        `Cannot create unique organization subdomain index: duplicate "${duplicate._id}" exists`,
      );
    }

    if (existingSubdomainIndex?.name) {
      await organizations.dropIndex(existingSubdomainIndex.name);
    }

    await organizations.createIndex(
      { subdomain: 1 },
      { name: 'subdomain_1', unique: true, sparse: true },
    );
  }

  if (
    !existingIndexes.some((index) => hasKey(index, { onboardedPlugins: 1 }))
  ) {
    await organizations.createIndex(
      { onboardedPlugins: 1 },
      { name: 'onboardedPlugins_1' },
    );
  }
};

const migrateSaas = async (dataClient: MongoClient) => {
  if (!CORE_MONGO_URL) {
    throw new Error('CORE_MONGO_URL is required when VERSION=saas');
  }

  const coreClient = new MongoClient(CORE_MONGO_URL);

  try {
    await coreClient.connect();

    const organizations = coreClient.db().collection('organizations');

    await ensureOrganizationIndexes(organizations);

    const contentOrganizations = await organizations
      .find<TOrganization>(
        {
          onboardedPlugins: 'content',
          subdomain: { $type: 'string' },
        },
        { projection: { _id: 1, subdomain: 1 } },
      )
      .toArray();

    let indexedDatabases = 0;

    for (const organization of contentOrganizations) {
      const databaseName = DB_NAME_TEMPLATE.replace(
        '<organizationId>',
        String(organization._id),
      );

      if (await ensurePostIndexes(dataClient.db(databaseName))) {
        indexedDatabases += 1;
      }
    }

    console.log(
      `Scheduled-post indexes ready for ${indexedDatabases} Content organization databases`,
    );
  } finally {
    await coreClient.close();
  }
};

/**
 * Adds the scheduler indexes to OS or all SaaS Content tenant databases.
 */
export const addScheduledPostIndexes = async () => {
  const dataClient = new MongoClient(MONGO_URL);

  try {
    await dataClient.connect();

    if (VERSION === 'saas') {
      await migrateSaas(dataClient);
    } else {
      const indexed = await ensurePostIndexes(dataClient.db());

      console.log(
        indexed
          ? 'Scheduled-post indexes are ready'
          : 'cms_posts does not exist; no post indexes were created',
      );
    }
  } finally {
    await dataClient.close();
  }
};

addScheduledPostIndexes().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';

  console.error(`Scheduled-post index migration failed: ${message}`);
  process.exitCode = 1;
});
