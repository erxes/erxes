import * as dotenv from 'dotenv';
import { Collection, Db, Document, MongoClient } from 'mongodb';

dotenv.config();

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);

type MergeMap = Map<string, string>;

type MergeType = 'customer' | 'company' | 'product';

type MergeCollections = {
  source: Collection;
  type: MergeType;
};

type MigrationStats = {
  modified: number;
  operations: number;
};

const emptyStats = (): MigrationStats => ({ modified: 0, operations: 0 });

const addStats = (stats: MigrationStats, modified: number) => {
  stats.modified += modified;
  stats.operations += 1;
};

const buildMergeMap = async ({
  source,
  type,
}: MergeCollections): Promise<MergeMap> => {
  const directMap = new Map<string, string>();

  const mergedDocs = await source
    .find(
      { mergedIds: { $exists: true, $ne: [] } },
      { projection: { _id: 1, mergedIds: 1, createdAt: 1, updatedAt: 1 } },
    )
    .sort({ createdAt: 1, updatedAt: 1 })
    .toArray();

  for (const doc of mergedDocs) {
    const newId = String(doc._id);
    const mergedIds = Array.isArray(doc.mergedIds) ? doc.mergedIds : [];

    for (const mergedId of mergedIds) {
      const oldId = String(mergedId);

      if (oldId && oldId !== newId) {
        directMap.set(oldId, newId);
      }
    }
  }

  const resolveFinalId = (oldId: string) => {
    const seen = new Set<string>();
    let currentId = oldId;

    while (directMap.has(currentId) && !seen.has(currentId)) {
      seen.add(currentId);
      currentId = directMap.get(currentId) || currentId;
    }

    return currentId;
  };

  const mergeMap = new Map<string, string>();

  for (const oldId of directMap.keys()) {
    const finalId = resolveFinalId(oldId);

    if (oldId !== finalId) {
      mergeMap.set(oldId, finalId);
    }
  }

  console.log(
    `[${type}] found ${mergedDocs.length} merged doc(s), ${mergeMap.size} old id mapping(s)`,
  );

  return mergeMap;
};

const replaceScalarReferences = async (
  collection: Collection,
  fieldName: string,
  mergeMap: MergeMap,
) => {
  const stats = emptyStats();

  for (const [oldId, newId] of mergeMap) {
    const result = await collection.updateMany(
      { [fieldName]: oldId },
      { $set: { [fieldName]: newId } },
    );

    addStats(stats, result.modifiedCount);
  }

  return stats;
};

const replaceArrayReferences = async (
  collection: Collection,
  fieldName: string,
  mergeMap: MergeMap,
) => {
  const stats = emptyStats();

  for (const [oldId, newId] of mergeMap) {
    const addResult = await collection.updateMany(
      { [fieldName]: oldId },
      { $addToSet: { [fieldName]: newId } },
    );
    const pullResult = await collection.updateMany(
      { [fieldName]: oldId },
      { $pull: { [fieldName]: oldId } } as Document,
    );

    addStats(stats, addResult.modifiedCount + pullResult.modifiedCount);
  }

  return stats;
};

const replaceRelationReferences = async (
  relations: Collection,
  contentType: string,
  mergeMap: MergeMap,
) => {
  const stats = emptyStats();

  for (const [oldId, newId] of mergeMap) {
    const result = await relations.updateMany(
      {
        entities: {
          $elemMatch: {
            contentType,
            contentId: oldId,
          },
        },
      },
      {
        $set: {
          'entities.$[entity].contentId': newId,
        },
      },
      {
        arrayFilters: [
          {
            'entity.contentType': contentType,
            'entity.contentId': oldId,
          },
        ],
      },
    );

    addStats(stats, result.modifiedCount);
  }

  return stats;
};

const replaceConformityReferences = async (
  conformities: Collection,
  type: MergeType,
  mergeMap: MergeMap,
) => {
  const stats = emptyStats();

  for (const [oldId, newId] of mergeMap) {
    const mainResult = await conformities.updateMany(
      { mainType: type, mainTypeId: oldId },
      { $set: { mainTypeId: newId } },
    );
    const relResult = await conformities.updateMany(
      { relType: type, relTypeId: oldId },
      { $set: { relTypeId: newId } },
    );

    addStats(stats, mainResult.modifiedCount + relResult.modifiedCount);
  }

  return stats;
};

const replaceBundleRuleProductReferences = async (
  bundleRules: Collection,
  mergeMap: MergeMap,
) => {
  const stats = emptyStats();

  for (const [oldId, newId] of mergeMap) {
    const addResult = await bundleRules.updateMany(
      { 'rules.productIds': oldId },
      { $addToSet: { 'rules.$[rule].productIds': newId } } as Document,
      { arrayFilters: [{ 'rule.productIds': oldId }] },
    );
    const pullResult = await bundleRules.updateMany(
      { 'rules.productIds': oldId },
      { $pull: { 'rules.$[rule].productIds': oldId } } as Document,
      { arrayFilters: [{ 'rule.productIds': oldId }] },
    );

    addStats(stats, addResult.modifiedCount + pullResult.modifiedCount);
  }

  return stats;
};

const replacePackageProductReferences = async (
  packages: Collection,
  mergeMap: MergeMap,
) => {
  const stats = emptyStats();

  for (const [oldId, newId] of mergeMap) {
    const result = await packages.updateMany(
      { 'products.productId': oldId },
      { $set: { 'products.$[product].productId': newId } },
      { arrayFilters: [{ 'product.productId': oldId }] },
    );

    addStats(stats, result.modifiedCount);
  }

  return stats;
};

const logStats = (label: string, stats: MigrationStats) => {
  console.log(
    `${label}: ${stats.modified} modified document(s) across ${stats.operations} update operation(s)`,
  );
};

const migrateCustomerReferences = async (db: Db, mergeMap: MergeMap) => {
  if (!mergeMap.size) {
    return;
  }

  console.log('Migrating customer references...');

  logStats(
    'client_portal_users.erxesCustomerId',
    await replaceScalarReferences(
      db.collection('client_portal_users'),
      'erxesCustomerId',
      mergeMap,
    ),
  );
  logStats(
    'form_submissions.customerId',
    await replaceScalarReferences(
      db.collection('form_submissions'),
      'customerId',
      mergeMap,
    ),
  );
  logStats(
    'broadcast_delivery_reports.customerId',
    await replaceScalarReferences(
      db.collection('broadcast_delivery_reports'),
      'customerId',
      mergeMap,
    ),
  );
  logStats(
    'broadcast_engage_messages.customerIds',
    await replaceArrayReferences(
      db.collection('broadcast_engage_messages'),
      'customerIds',
      mergeMap,
    ),
  );
  logStats(
    'broadcast_engage_messages.messengerReceivedCustomerIds',
    await replaceArrayReferences(
      db.collection('broadcast_engage_messages'),
      'messengerReceivedCustomerIds',
      mergeMap,
    ),
  );
  logStats(
    'relations core:customer',
    await replaceRelationReferences(
      db.collection('relations'),
      'core:customer',
      mergeMap,
    ),
  );
  logStats(
    'conformities customer',
    await replaceConformityReferences(
      db.collection('conformities'),
      'customer',
      mergeMap,
    ),
  );
};

const migrateCompanyReferences = async (db: Db, mergeMap: MergeMap) => {
  if (!mergeMap.size) {
    return;
  }

  console.log('Migrating company references...');

  logStats(
    'client_portal_users.erxesCompanyId',
    await replaceScalarReferences(
      db.collection('client_portal_users'),
      'erxesCompanyId',
      mergeMap,
    ),
  );
  logStats(
    'products.vendorId',
    await replaceScalarReferences(
      db.collection('products'),
      'vendorId',
      mergeMap,
    ),
  );
  logStats(
    'product_similarities.info.vendorId',
    await replaceScalarReferences(
      db.collection('product_similarities'),
      'info.vendorId',
      mergeMap,
    ),
  );
  logStats(
    'relations core:company',
    await replaceRelationReferences(
      db.collection('relations'),
      'core:company',
      mergeMap,
    ),
  );
  logStats(
    'conformities company',
    await replaceConformityReferences(
      db.collection('conformities'),
      'company',
      mergeMap,
    ),
  );
};

const migrateProductReferences = async (db: Db, mergeMap: MergeMap) => {
  if (!mergeMap.size) {
    return;
  }

  console.log('Migrating product references...');

  logStats(
    'product_rules.productIds',
    await replaceArrayReferences(
      db.collection('product_rules'),
      'productIds',
      mergeMap,
    ),
  );
  logStats(
    'product_rules.excludeProductIds',
    await replaceArrayReferences(
      db.collection('product_rules'),
      'excludeProductIds',
      mergeMap,
    ),
  );
  logStats(
    'product_similarities.productIds',
    await replaceArrayReferences(
      db.collection('product_similarities'),
      'productIds',
      mergeMap,
    ),
  );
  logStats(
    'product_similarities.starProductId',
    await replaceScalarReferences(
      db.collection('product_similarities'),
      'starProductId',
      mergeMap,
    ),
  );
  logStats(
    'bundle_rules.rules.productIds',
    await replaceBundleRuleProductReferences(
      db.collection('bundle_rules'),
      mergeMap,
    ),
  );
  logStats(
    'product_packages.products.productId',
    await replacePackageProductReferences(
      db.collection('product_packages'),
      mergeMap,
    ),
  );
  logStats(
    'relations core:product',
    await replaceRelationReferences(
      db.collection('relations'),
      'core:product',
      mergeMap,
    ),
  );
  logStats(
    'conformities product',
    await replaceConformityReferences(
      db.collection('conformities'),
      'product',
      mergeMap,
    ),
  );
};

const command = async () => {
  await client.connect();

  const db = client.db();

  console.log(`Process started at: ${new Date().toISOString()}`);
  console.log(`Database: ${db.databaseName}`);

  const customerMergeMap = await buildMergeMap({
    source: db.collection('customers'),
    type: 'customer',
  });
  const companyMergeMap = await buildMergeMap({
    source: db.collection('companies'),
    type: 'company',
  });
  const productMergeMap = await buildMergeMap({
    source: db.collection('products'),
    type: 'product',
  });

  await migrateCustomerReferences(db, customerMergeMap);
  await migrateCompanyReferences(db, companyMergeMap);
  await migrateProductReferences(db, productMergeMap);

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
