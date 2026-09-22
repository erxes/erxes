import { AnyBulkWriteOperation, Collection, Db, Document } from 'mongodb';
import type { ObjectId } from 'mongodb';

import {
  WordPressImportPlan,
  WordPressImportTarget,
  WordPressMappingDocument,
} from './types';

interface CollectionWriteStats {
  matched: number;
  upserted: number;
}

export interface WordPressWriteReport {
  collections: Record<string, CollectionWriteStats>;
  cmsUpdated: number;
}

export const loadWordPressMappings = async (
  db: Db,
  sourceSite: string,
  clientPortalId: string,
): Promise<WordPressMappingDocument[]> =>
  db
    .collection<WordPressMappingDocument>('migration_wordpress_mappings')
    .find({
      source: 'wordpress',
      sourceSite,
      clientPortalId,
    })
    .toArray();

export const prepareWordPressMappingCollection = async (
  db: Db,
): Promise<void> => {
  await db
    .collection<WordPressMappingDocument>('migration_wordpress_mappings')
    .createIndex(
      {
        source: 1,
        sourceSite: 1,
        clientPortalId: 1,
        sourceType: 1,
        sourceId: 1,
        targetCollection: 1,
      },
      {
        name: 'wordpress_source_target_unique',
        unique: true,
      },
    );
};

interface ImportDocument extends Document {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TranslationImportDocument extends ImportDocument {
  objectId: string;
  language: string;
  type: string;
}

interface CmsTargetDocument extends Document {
  _id: string | ObjectId;
  clientPortalId: string;
}

const withoutUndefined = (document: Document): Document =>
  Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  );

const inBatches = <T>(values: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];

  for (let index = 0; index < values.length; index += batchSize) {
    batches.push(values.slice(index, index + batchSize));
  }

  return batches;
};

const findConflicts = async (
  collection: Collection<ImportDocument>,
  documents: ImportDocument[],
  field: string,
  clientPortalId?: string,
): Promise<string[]> => {
  const values = [
    ...new Set(
      documents
        .map((document) => document[field])
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.length > 0,
        ),
    ),
  ];

  if (values.length === 0) {
    return [];
  }

  const query: Document = {
    [field]: { $in: values },
    _id: { $nin: documents.map(({ _id }) => _id) },
  };

  if (clientPortalId) {
    query.clientPortalId = clientPortalId;
  }

  const conflicts = await collection
    .find(query, { projection: { _id: 1, [field]: 1 } })
    .toArray();

  return conflicts.map(
    (document) =>
      `${collection.collectionName}.${field}="${String(
        document[field],
      )}" (_id=${String(document._id)})`,
  );
};

const findIdOwnershipConflicts = async (
  db: Db,
  plan: WordPressImportPlan,
  collectionName: string,
  documents: ImportDocument[],
): Promise<string[]> => {
  const targetIds = documents.map(({ _id }) => _id);

  if (targetIds.length === 0) {
    return [];
  }

  const [existingDocuments, ownershipMappings] = await Promise.all([
    db
      .collection<ImportDocument>(collectionName)
      .find({ _id: { $in: targetIds } }, { projection: { _id: 1 } })
      .toArray(),
    db
      .collection<ImportDocument>('migration_wordpress_mappings')
      .find(
        {
          _id: {
            $in: plan.mappings
              .filter(
                ({ targetCollection, targetId }) =>
                  targetCollection === collectionName &&
                  targetIds.includes(targetId),
              )
              .map(({ _id }) => _id),
          },
          source: 'wordpress',
          sourceSite: plan.sourceSite,
          clientPortalId: plan.clientPortalId,
          targetCollection: collectionName,
        },
        { projection: { targetId: 1 } },
      )
      .toArray(),
  ]);
  const ownedTargetIds = new Set(
    ownershipMappings.map(({ targetId }) => String(targetId)),
  );

  return existingDocuments
    .map(({ _id }) => String(_id))
    .filter((targetId) => !ownedTargetIds.has(targetId))
    .map((targetId) => `${collectionName}._id="${targetId}"`);
};

const findTranslationIdentityConflicts = async (
  db: Db,
  documents: TranslationImportDocument[],
): Promise<string[]> => {
  if (documents.length === 0) {
    return [];
  }

  const identities = new Set(
    documents.map(
      ({ objectId, language, type }) =>
        `${objectId}\u0000${language}\u0000${type}`,
    ),
  );
  const existing = await db
    .collection<TranslationImportDocument>('cms_translations')
    .find({
      objectId: {
        $in: [...new Set(documents.map(({ objectId }) => objectId))],
      },
      _id: { $nin: documents.map(({ _id }) => _id) },
    })
    .toArray();

  return existing
    .filter(({ objectId, language, type }) =>
      identities.has(`${objectId}\u0000${language}\u0000${type}`),
    )
    .map(
      ({ _id, objectId, language, type }) =>
        `cms_translations objectId="${objectId}", language="${language}", type="${type}" (_id=${_id})`,
    );
};

export const validateImportConflicts = async (
  db: Db,
  plan: WordPressImportPlan,
): Promise<void> => {
  const uniqueValueChecks = await Promise.all([
    findConflicts(
      db.collection<ImportDocument>('cms_posts'),
      plan.posts,
      'slug',
      plan.clientPortalId,
    ),
    findConflicts(
      db.collection<ImportDocument>('cms_categories'),
      plan.categories,
      'slug',
      plan.clientPortalId,
    ),
    findConflicts(
      db.collection<ImportDocument>('cms_tags'),
      plan.tags,
      'slug',
      plan.clientPortalId,
    ),
    findConflicts(
      db.collection<ImportDocument>('cms_custom_post_types'),
      plan.customPostTypes,
      'name',
      plan.clientPortalId,
    ),
    findConflicts(
      db.collection<ImportDocument>('cms_custom_post_types'),
      plan.customPostTypes,
      'code',
      plan.clientPortalId,
    ),
    findConflicts(
      db.collection<ImportDocument>('cms_custom_field_groups'),
      plan.customFieldGroups,
      'code',
      plan.clientPortalId,
    ),
    findTranslationIdentityConflicts(db, plan.translations),
  ]);
  const ownershipChecks = await Promise.all([
    findIdOwnershipConflicts(db, plan, 'cms_categories', plan.categories),
    findIdOwnershipConflicts(db, plan, 'cms_tags', plan.tags),
    findIdOwnershipConflicts(
      db,
      plan,
      'cms_custom_post_types',
      plan.customPostTypes,
    ),
    findIdOwnershipConflicts(
      db,
      plan,
      'cms_custom_field_groups',
      plan.customFieldGroups,
    ),
    findIdOwnershipConflicts(db, plan, 'cms_posts', plan.posts),
    findIdOwnershipConflicts(db, plan, 'cms_pages', plan.pages),
    findIdOwnershipConflicts(db, plan, 'cms_translations', plan.translations),
    findIdOwnershipConflicts(db, plan, 'cms_menu_items', plan.menus),
  ]);
  const conflicts = [...uniqueValueChecks, ...ownershipChecks].flat();

  if (conflicts.length > 0) {
    throw new Error(
      `Import stopped before writing because target records already use WordPress values:\n- ${conflicts.join(
        '\n- ',
      )}`,
    );
  }
};

const upsertDocuments = async (
  collection: Collection<ImportDocument>,
  documents: ImportDocument[],
  batchSize: number,
): Promise<CollectionWriteStats> => {
  const stats: CollectionWriteStats = { matched: 0, upserted: 0 };

  for (const batch of inBatches(documents, batchSize)) {
    const operations: AnyBulkWriteOperation<ImportDocument>[] = batch.map(
      (document) => {
        const { _id, createdAt, updatedAt, ...ownedFields } = document;

        return {
          updateOne: {
            filter: { _id },
            update: {
              $set: withoutUndefined({
                ...ownedFields,
                updatedAt: updatedAt || new Date(),
              }),
              $setOnInsert: {
                createdAt: createdAt || new Date(),
              },
            },
            upsert: true,
          },
        };
      },
    );
    const result = await collection.bulkWrite(operations, {
      ordered: false,
    });

    stats.matched += result.matchedCount;
    stats.upserted += result.upsertedCount;
  }

  return stats;
};

export const writeImportPlan = async (
  db: Db,
  target: WordPressImportTarget,
  plan: WordPressImportPlan,
  batchSize: number,
): Promise<WordPressWriteReport> => {
  const collections: [string, ImportDocument[]][] = [
    ['migration_wordpress_mappings', plan.mappings],
    ['cms_categories', plan.categories],
    ['cms_tags', plan.tags],
    ['cms_custom_post_types', plan.customPostTypes],
    ['cms_custom_field_groups', plan.customFieldGroups],
    ['cms_posts', plan.posts],
    ['cms_pages', plan.pages],
    ['cms_translations', plan.translations],
    ['cms_menu_items', plan.menus],
  ];
  const report: WordPressWriteReport = {
    collections: {},
    cmsUpdated: 0,
  };
  const cmsCollection = db.collection<CmsTargetDocument>('content_cms');
  const cmsTarget = await cmsCollection.findOne(
    {
      _id: target.cmsId,
      clientPortalId: plan.clientPortalId,
    },
    { projection: { _id: 1 } },
  );

  if (!cmsTarget) {
    throw new Error(
      `Target CMS "${target.cmsId}" was not found before the import write.`,
    );
  }

  for (const [collectionName, documents] of collections) {
    report.collections[collectionName] = await upsertDocuments(
      db.collection<ImportDocument>(collectionName),
      documents,
      batchSize,
    );
  }

  const cmsResult = await cmsCollection.updateOne(
    {
      _id: target.cmsId,
      clientPortalId: plan.clientPortalId,
    },
    {
      $set: {
        ...plan.cmsUpdate,
        updatedAt: new Date(),
      },
    },
  );

  if (cmsResult.matchedCount !== 1) {
    throw new Error(
      `Target CMS "${target.cmsId}" disappeared before the metadata update.`,
    );
  }

  report.cmsUpdated = cmsResult.matchedCount;

  return report;
};
