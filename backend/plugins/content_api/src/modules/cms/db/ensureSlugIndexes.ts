import { IModels } from '~/connectionResolvers';

type IndexKey = Record<string, 1 | -1>;

interface IExistingIndex {
  name?: string;
  unique?: boolean;
  key?: Record<string, unknown>;
}

interface IIndexedCollection {
  indexes(): Promise<IExistingIndex[]>;
  createIndex(
    key: IndexKey,
    options: { unique: boolean; sparse?: boolean },
  ): Promise<string>;
  dropIndex(name: string): Promise<unknown>;
}

interface ISiteSlugIndex {
  collection: IIndexedCollection;
  key: IndexKey;
  options: { unique: boolean; sparse?: boolean };
}

const NAMESPACE_NOT_FOUND = 26;
const INDEX_NOT_FOUND = 27;

const reconciled = new Set<string>();
const reconciling = new Map<string, Promise<void>>();

const hasErrorCode = (error: unknown, code: number) =>
  (error as { code?: number } | null)?.code === code;

const isGlobalUniqueSlugIndex = (index: IExistingIndex) =>
  index.unique === true && Object.keys(index.key ?? {}).join() === 'slug';

/**
 * Older schemas declared `slug` unique across the whole tenant database, while
 * slugs are generated and looked up per CMS site. A slug used by one site then
 * made saving the same slug on another site fail with E11000. The per-site
 * unique index is created first, so the global one is only dropped once
 * duplicates within a site are still rejected.
 */
const replaceGlobalSlugIndex = async ({
  collection,
  key,
  options,
}: ISiteSlugIndex) => {
  let indexes: IExistingIndex[];

  try {
    indexes = await collection.indexes();
  } catch (error) {
    if (hasErrorCode(error, NAMESPACE_NOT_FOUND)) {
      return;
    }

    throw error;
  }

  const legacyIndexes = indexes.filter(isGlobalUniqueSlugIndex);

  if (!legacyIndexes.length) {
    return;
  }

  await collection.createIndex(key, options);

  for (const index of legacyIndexes) {
    if (!index.name) {
      continue;
    }

    try {
      await collection.dropIndex(index.name);
    } catch (error) {
      // Another replica dropped it first.
      if (!hasErrorCode(error, INDEX_NOT_FOUND)) {
        throw error;
      }
    }
  }
};

const reconcileSlugIndexes = async (models: IModels) => {
  await replaceGlobalSlugIndex({
    collection: models.Posts.collection,
    key: { slug: 1, clientPortalId: 1 },
    options: { unique: true, sparse: true },
  });

  await replaceGlobalSlugIndex({
    collection: models.PostTags.collection,
    key: { clientPortalId: 1, slug: 1 },
    options: { unique: true },
  });
};

export const ensureCmsSlugIndexes = async (models: IModels): Promise<void> => {
  const tenantDb = models.Posts.db.name;

  if (reconciled.has(tenantDb)) {
    return;
  }

  const running = reconciling.get(tenantDb);

  if (running) {
    return running;
  }

  const run = reconcileSlugIndexes(models)
    .then(() => {
      reconciled.add(tenantDb);
    })
    .catch((error: unknown) => {
      console.error(
        '[content] Could not replace the global CMS slug index; it will retry.',
        error instanceof Error ? error.message : error,
      );
    })
    .finally(() => {
      reconciling.delete(tenantDb);
    });

  reconciling.set(tenantDb, run);

  return run;
};
