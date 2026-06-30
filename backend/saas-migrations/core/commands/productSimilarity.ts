import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  TARGET_SUBDOMAIN,
  DRY_RUN,
} = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

if (!TARGET_SUBDOMAIN) {
  throw new Error('Environment variable TARGET_SUBDOMAIN must be set.');
}


const isDryRun = DRY_RUN !== 'false';

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

let db: Db;
let Products: Collection;

const RICHNESS_FIELDS = [
  'attachment',
  'barcodes',
  'barcodeDescription',
  'variants',
  'propertiesData',
  'customFieldsData',
  'scopeBrandIds',
  'sameDefault',
];

function isNonEmpty(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Date) return true;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function completeness(doc: any): number {
  return RICHNESS_FIELDS.reduce(
    (score, field) => score + (isNonEmpty(doc[field]) ? 1 : 0),
    0,
  );
}

function pickMaster(docs: any[]): any {
  const active = docs.filter((doc) => doc.status !== 'deleted');
  const candidates = active.length > 0 ? active : docs;

  return candidates.reduce((best, doc) => {
    if (!best) return doc;

    const bestScore = completeness(best);
    const docScore = completeness(doc);

    if (docScore !== bestScore) {
      return docScore > bestScore ? doc : best;
    }

    const bestUpdatedAt = new Date(best.updatedAt || 0).getTime();
    const docUpdatedAt = new Date(doc.updatedAt || 0).getTime();

    return docUpdatedAt > bestUpdatedAt ? doc : best;
  }, undefined);
}

function unique(values: any[]): any[] {
  return [...new Set(values.filter((v) => v !== undefined && v !== null))];
}

function mergeGroup(docs: any[]): {
  master: any;
  update: Record<string, any>;
  deleteIds: any[];
} {
  const master = pickMaster(docs);
  const duplicates = docs.filter(
    (doc) => String(doc._id) !== String(master._id),
  );

  const update: Record<string, any> = {};

  const barcodes = unique(docs.flatMap((doc) => doc.barcodes || []));
  if (barcodes.length) update.barcodes = barcodes;

  const variants = Object.assign(
    {},
    ...duplicates.map((doc) => doc.variants || {}),
    master.variants || {},
  );
  if (Object.keys(variants).length) update.variants = variants;

  const propertiesData = Object.assign(
    {},
    ...duplicates.map((doc) => doc.propertiesData || {}),
    master.propertiesData || {},
  );
  if (Object.keys(propertiesData).length) update.propertiesData = propertiesData;

  const customFieldsByField = new Map<string, any>();
  for (const doc of duplicates) {
    for (const cf of doc.customFieldsData || []) {
      customFieldsByField.set(String(cf.field), cf);
    }
  }
  for (const cf of master.customFieldsData || []) {
    customFieldsByField.set(String(cf.field), cf);
  }
  if (customFieldsByField.size) {
    update.customFieldsData = [...customFieldsByField.values()];
  }

  if (!isNonEmpty(master.attachment)) {
    const withAttachment = duplicates.find((doc) => isNonEmpty(doc.attachment));
    if (withAttachment) update.attachment = withAttachment.attachment;
  }

  if (!isNonEmpty(master.barcodeDescription)) {
    const withDescription = duplicates.find((doc) =>
      isNonEmpty(doc.barcodeDescription),
    );
    if (withDescription) update.barcodeDescription = withDescription.barcodeDescription;
  }

  const scopeBrandIds = unique(docs.flatMap((doc) => doc.scopeBrandIds || []));
  if (scopeBrandIds.length) update.scopeBrandIds = scopeBrandIds;

  const sameDefault = unique(docs.flatMap((doc) => doc.sameDefault || []));
  if (sameDefault.length) update.sameDefault = sameDefault;

  for (const doc of duplicates) {
    for (const key of Object.keys(doc)) {
      if (key === '_id') continue;
      if (master[key] === undefined && update[key] === undefined) {
        update[key] = doc[key];
      }
    }
  }

  if (master.status === 'deleted' && docs.some((doc) => doc.status !== 'deleted')) {
    update.status = 'active';
  }

  return { master, update, deleteIds: duplicates.map((doc) => doc._id) };
}

const BATCH_SIZE = 500;

const command = async () => {
  await client.connect();
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);
  const coreDb = client.db(coreDbName);

  const targetOrg = await coreDb
    .collection('organizations')
    .findOne({ subdomain: TARGET_SUBDOMAIN }, { projection: { _id: 1 } });

  if (!targetOrg) {
    throw new Error(
      `Organization with subdomain "${TARGET_SUBDOMAIN}" not found in ${coreDbName}.organizations`,
    );
  }

  const targetDbName = `erxes_${targetOrg._id}`;
  console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}`);
  console.log(
    `Mode: ${isDryRun ? 'DRY RUN (no writes; set DRY_RUN=false to apply)' : 'APPLY'}`,
  );

  db = client.db(targetDbName) as Db;
  Products = db.collection('products');

  try {
    const duplicateGroups = await Products.aggregate([
      { $match: { name: { $exists: true, $nin: [null, ''] } } },
      { $group: { _id: '$name', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } },
    ], { allowDiskUse: true }).toArray();

    console.log(`Found ${duplicateGroups.length} duplicate name group(s).`);

    let mergedGroups = 0;
    let deletedDocs = 0;

    for (let i = 0; i < duplicateGroups.length; i += BATCH_SIZE) {
      const batch = duplicateGroups.slice(i, i + BATCH_SIZE);
      const ids = batch.flatMap((group) => group.ids);

      const docs = await Products.find({ _id: { $in: ids } }).toArray();

      const docsByName = new Map<string, any[]>();
      for (const doc of docs) {
        const list = docsByName.get(doc.name) || [];
        list.push(doc);
        docsByName.set(doc.name, list);
      }

      const bulkOps: any[] = [];

      for (const group of batch) {
        const groupDocs = docsByName.get(group._id) || [];
        if (groupDocs.length < 2) continue;

        const { master, update, deleteIds } = mergeGroup(groupDocs);

        console.log(
          `"${group._id}": master=${master._id}, merging ${deleteIds.length} duplicate(s) [${deleteIds.join(', ')}]`,
        );

        if (Object.keys(update).length) {
          bulkOps.push({
            updateOne: { filter: { _id: master._id }, update: { $set: update } },
          });
        }

        bulkOps.push({
          deleteMany: { filter: { _id: { $in: deleteIds } } },
        });

        mergedGroups += 1;
        deletedDocs += deleteIds.length;
      }

      if (bulkOps.length && !isDryRun) {
        await Products.bulkWrite(bulkOps, { ordered: false });
      }
    }

    console.log(
      `${isDryRun ? '[DRY RUN] Would merge' : 'Merged'} ${mergedGroups} group(s), ${isDryRun ? 'would delete' : 'deleted'} ${deletedDocs} duplicate document(s).`,
    );
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
