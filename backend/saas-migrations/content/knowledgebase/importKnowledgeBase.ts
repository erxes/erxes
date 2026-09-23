import { BSON, Db, Filter, MongoClient, WithId } from 'mongodb';
import { extractDatabaseName } from '../wordpress/resolveTarget';
import { buildPlan } from './buildPlan';
import {
  fingerprint,
  sourceFingerprint,
  targetFingerprint,
} from './fingerprint';
import {
  ImportOptions,
  ImportPlan,
  Mapping,
  MAPPING_COLLECTION,
  RecordDocument,
  Snapshot,
  TARGET_COLLECTIONS,
  TargetCollection,
} from './types';

export interface ImportReport {
  dryRun: boolean;
  sourceDb: string;
  targetDb: string;
  counts: Record<string, number>;
  warnings: string[];
  errors: string[];
  inserted: number;
  unchanged: number;
}

export const loadSnapshot = async (
  client: MongoClient,
  options: ImportOptions,
): Promise<Snapshot> => {
  const coreDb = client.db(extractDatabaseName(options.mongoUrl));
  const resolveTenant = async (subdomain: string): Promise<Db> => {
    const organizations = await coreDb
      .collection('organizations')
      .find({ subdomain })
      .limit(2)
      .toArray();
    if (organizations.length !== 1 || !organizations[0]._id)
      throw new Error(`Expected one organization for ${subdomain}.`);
    return client.db(`erxes_${String(organizations[0]._id)}`);
  };
  const sourceDb = await resolveTenant(options.sourceSubdomain);
  const targetDb = await resolveTenant(options.targetSubdomain);
  const portal = await targetDb
    .collection<RecordDocument>('client_portals')
    .findOne({ _id: options.clientPortalId }, { projection: { _id: 1 } });
  const cmsRecords = await targetDb
    .collection<Snapshot['cms']>('content_cms')
    .find({ clientPortalId: options.clientPortalId })
    .limit(2)
    .toArray();
  if (!portal || cmsRecords.length !== 1)
    throw new Error(
      'Target must have an existing client portal and exactly one linked content CMS.',
    );

  let documents = 0;
  let bytes = 0;
  const read = async <T extends RecordDocument>(
    db: Db,
    collection: string,
    filter: Filter<T> = {},
  ): Promise<WithId<T>[]> => {
    const result: WithId<T>[] = [];
    for await (const document of db
      .collection<T>(collection)
      .find(filter)
      .sort({ _id: 1 })
      .batchSize(options.batchSize)) {
      documents++;
      bytes += BSON.calculateObjectSize(document);
      if (documents > options.maxDocuments || bytes > options.maxBytes)
        throw new Error(
          'Inventory exceeds KB_MAX_DOCUMENTS or KB_MAX_BYTES. Select fewer topics or raise the explicit inventory limits.',
        );
      if (typeof document._id !== 'string' || !document._id)
        throw new Error(`${collection} contains a non-string or empty ID.`);
      result.push(document);
    }
    return result;
  };
  const topicFilter = options.topicIds.length
    ? { _id: { $in: options.topicIds } }
    : {};
  const topics = await read(sourceDb, 'knowledgebase_topics', topicFilter);
  const topicIds = topics.map(({ _id }) => _id);
  const categories = await read(
    sourceDb,
    'knowledgebase_categories',
    options.topicIds.length
      ? {
          $or: [
            { topicId: { $in: topicIds } },
            {
              _id: {
                $in: topics.flatMap((topic) =>
                  Array.isArray(topic.categoryIds) ? topic.categoryIds : [],
                ),
              },
            },
          ],
        }
      : {},
  );
  const articles = await read(
    sourceDb,
    'knowledgebase_articles',
    options.topicIds.length
      ? {
          $or: [
            { topicId: { $in: topicIds } },
            { categoryId: { $in: categories.map(({ _id }) => _id) } },
          ],
        }
      : {},
  );
  const translations = await read(sourceDb, 'cms_translations', {
    type: {
      $in: [
        'knowledgeBaseTopic',
        'knowledgeBaseCategory',
        'knowledgeBaseArticle',
      ],
    },
    ...(options.topicIds.length
      ? {
          objectId: {
            $in: [
              ...topicIds,
              ...categories.map(({ _id }) => _id),
              ...articles.map(({ _id }) => _id),
            ],
          },
        }
      : {}),
  });
  const userIds = new Set<string>();
  const referencedAuthors = [
    ...new Set([
      ...articles
        .map((article) => article.createdBy)
        .filter((id): id is string => typeof id === 'string'),
      ...Object.values(options.authorMap),
      ...(options.fallbackAuthorId ? [options.fallbackAuthorId] : []),
    ]),
  ];
  for (
    let start = 0;
    start < referencedAuthors.length;
    start += options.batchSize
  ) {
    const users = await targetDb
      .collection<RecordDocument>('users')
      .find(
        {
          _id: {
            $in: referencedAuthors.slice(start, start + options.batchSize),
          },
        },
        { projection: { _id: 1 } },
      )
      .toArray();
    users.forEach((user) => userIds.add(user._id));
  }
  for (const id of [
    ...Object.values(options.authorMap),
    ...(options.fallbackAuthorId ? [options.fallbackAuthorId] : []),
  ]) {
    if (!userIds.has(id))
      throw new Error(
        `Configured target author ${id} does not exist in target users.`,
      );
  }
  const target: Snapshot['target'] = {
    cms_categories: [],
    cms_posts: [],
    cms_custom_post_types: [],
    cms_translations: [],
  };
  for (const collection of TARGET_COLLECTIONS)
    target[collection] = await read(targetDb, collection);
  const mappings = await read<Mapping>(targetDb, MAPPING_COLLECTION);
  for (const mapping of mappings) {
    if (
      mapping.version !== 1 ||
      !TARGET_COLLECTIONS.includes(mapping.targetCollection) ||
      !mapping.targetDocument ||
      !mapping.sourceDocument ||
      sourceFingerprint(mapping.kind, mapping.sourceDocument) !==
        mapping.sourceHash ||
      targetFingerprint(mapping.targetCollection, mapping.targetDocument) !==
        mapping.targetHash
    ) {
      throw new Error(
        `Invalid or modified migration mapping ${mapping._id}. Restore its backed-up metadata before rerunning.`,
      );
    }
  }
  return {
    sourceDb: sourceDb.databaseName,
    targetDb: targetDb.databaseName,
    cms: cmsRecords[0],
    topics,
    categories,
    articles,
    translations,
    userIds,
    target,
    mappings,
  };
};

const allowedIndexes: Record<TargetCollection, Set<string>> = {
  cms_posts: new Set([
    '_id',
    'slug',
    'clientPortalId,slug',
    'clientPortalId,count',
  ]),
  cms_categories: new Set(['_id', 'slug', 'clientPortalId,slug']),
  cms_custom_post_types: new Set([
    '_id',
    'name',
    'code',
    'clientPortalId,name',
    'clientPortalId,code',
  ]),
  cms_translations: new Set(['_id', 'language,objectId,type']),
};

export const validateIndexes = async (
  db: Db,
  plan: ImportPlan,
  snapshot: Snapshot,
): Promise<void> => {
  const names = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map(
      ({ name }) => name,
    ),
  );
  for (const collection of TARGET_COLLECTIONS) {
    if (!names.has(collection)) continue;
    for (const index of await db
      .collection(collection)
      .listIndexes()
      .toArray()) {
      if (!index.unique) continue;
      const signature = Object.keys(index.key).sort().join(',');
      if (
        !allowedIndexes[collection].has(signature) ||
        index.collation ||
        index.partialFilterExpression
      ) {
        plan.errors.push(
          `${collection}: unique index ${index.name} requires explicit collision handling before import.`,
        );
        continue;
      }
      const fields = Object.keys(index.key);
      const values = new Map<string, string>();
      for (const document of [
        ...snapshot.target[collection],
        ...plan.mappings
          .filter((mapping) => mapping.targetCollection === collection)
          .map((mapping) => mapping.targetDocument),
      ]) {
        if (
          index.sparse &&
          fields.every((field) => document[field] === undefined)
        )
          continue;
        const identity = fingerprint(
          fields.map((field) => document[field] ?? null),
        );
        if (values.has(identity) && values.get(identity) !== document._id)
          plan.errors.push(
            `${collection}/${document._id}: collision on unique index ${index.name}.`,
          );
        values.set(identity, document._id);
      }
    }
  }
};

const assertStoredMapping = (
  actual: Mapping | null,
  expected: Mapping,
): void => {
  if (!actual || fingerprint(actual) !== fingerprint(expected))
    throw new Error(
      `Concurrent or modified mapping ${expected._id}; rerun preflight.`,
    );
};

export const writePlan = async (
  db: Db,
  snapshot: Snapshot,
  plan: ImportPlan,
  batchSize: number,
): Promise<{ inserted: number; unchanged: number }> => {
  if (plan.errors.length)
    throw new Error('Cannot write a plan with preflight errors.');
  const portalId = snapshot.cms.clientPortalId;
  const cms = await db
    .collection<Snapshot['cms']>('content_cms')
    .findOne({ _id: snapshot.cms._id, clientPortalId: portalId });
  if (!cms || fingerprint(cms) !== fingerprint(snapshot.cms))
    throw new Error('Target CMS changed during preflight.');
  if (plan.reusedPostTypeId) {
    const postType = await db
      .collection<RecordDocument>('cms_custom_post_types')
      .findOne({
        _id: plan.reusedPostTypeId,
        clientPortalId: portalId,
        code: 'knowledgebase',
        isActive: true,
      });
    if (!postType)
      throw new Error('Reused knowledgebase post type is no longer available.');
  }
  const ledger = db.collection<Mapping>(MAPPING_COLLECTION);
  // Reserve every target before inserting content. Reservations are immutable;
  // a crash between these stages can be resumed without guessing ownership.
  for (let start = 0; start < plan.mappings.length; start += batchSize) {
    const batch = plan.mappings.slice(start, start + batchSize);
    await ledger.bulkWrite(
      batch.map((mapping) => ({
        updateOne: {
          filter: { _id: mapping._id },
          update: { $setOnInsert: mapping },
          upsert: true,
        },
      })),
      { ordered: true },
    );
    const stored = await ledger
      .find({ _id: { $in: batch.map(({ _id }) => _id) } })
      .toArray();
    for (const mapping of batch)
      assertStoredMapping(
        stored.find(({ _id }) => _id === mapping._id) || null,
        mapping,
      );
  }
  let inserted = 0;
  let unchanged = 0;
  for (const collection of TARGET_COLLECTIONS) {
    const records = plan.mappings.filter(
      (mapping) => mapping.targetCollection === collection,
    );
    const target = db.collection<RecordDocument>(collection);
    for (let start = 0; start < records.length; start += batchSize) {
      const batch = records.slice(start, start + batchSize);
      const result = await target.bulkWrite(
        batch.map(({ targetDocument }) => ({
          updateOne: {
            filter: { _id: targetDocument._id },
            update: { $setOnInsert: targetDocument },
            upsert: true,
          },
        })),
        { ordered: true },
      );
      inserted += result.upsertedCount;
      unchanged += result.matchedCount;
      const stored = await target
        .find({
          _id: { $in: batch.map(({ targetDocument }) => targetDocument._id) },
        })
        .toArray();
      for (const mapping of batch) {
        const record = stored.find(
          ({ _id }) => _id === mapping.targetDocument._id,
        );
        if (
          !record ||
          targetFingerprint(collection, record) !== mapping.targetHash
        )
          throw new Error(
            `${collection}/${mapping.targetDocument._id}: destination differs from the reserved content. No existing document was overwritten.`,
          );
      }
    }
  }
  return { inserted, unchanged };
};

export const runImport = async (
  options: ImportOptions,
): Promise<ImportReport> => {
  const client = new MongoClient(options.mongoUrl, {
    serverSelectionTimeoutMS: 10000,
  });
  try {
    await client.connect();
    const snapshot = await loadSnapshot(client, options);
    const plan = buildPlan(snapshot, options);
    const targetDb = client.db(snapshot.targetDb);
    await validateIndexes(targetDb, plan, snapshot);
    const report: ImportReport = {
      dryRun: options.dryRun,
      sourceDb: snapshot.sourceDb,
      targetDb: snapshot.targetDb,
      counts: plan.counts,
      warnings: [...new Set(plan.warnings)],
      errors: [...new Set(plan.errors)],
      inserted: 0,
      unchanged: 0,
    };
    if (!options.dryRun && !plan.errors.length)
      Object.assign(
        report,
        await writePlan(targetDb, snapshot, plan, options.batchSize),
      );
    return report;
  } finally {
    await client.close();
  }
};
