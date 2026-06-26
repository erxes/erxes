import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  TARGET_SUBDOMAIN,
} = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

if (!TARGET_SUBDOMAIN) {
  throw new Error('Environment variable TARGET_SUBDOMAIN must be set.');
}

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

let db: Db;
let Tags: Collection;

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

  db = client.db(targetDbName) as Db;
  Tags = db.collection('tags');

  try {
    const allTags = await Tags.find({}).toArray();

    const parentIdSet = new Set<string>(
      allTags
        .map((t) => String(t.parentId))
        .filter((id) => id && id !== ''),
    );


    const nestedGroupIds = new Set<string>(
      allTags
        .filter((t) => parentIdSet.has(String(t._id)) && t.parentId && String(t.parentId) !== '')
        .map((t) => String(t._id)),
    );

    if (nestedGroupIds.size > 0) {
      console.log(
        `Promoting ${nestedGroupIds.size} nested group(s) to root level: ${[...nestedGroupIds].join(', ')}`,
      );
    }

    const tagMap = new Map<string, any>(allTags.map((t) => [String(t._id), t]));


    function computeOrder(tagId: string, visited = new Set<string>()): string {
      if (visited.has(tagId)) return '';
      visited.add(tagId);

      const tag = tagMap.get(tagId);
      if (!tag) return '';

      const effectiveParentId =
        nestedGroupIds.has(tagId) ? '' : (tag.parentId ? String(tag.parentId) : '');

      if (!effectiveParentId) {
        return `${tag.name}/`;
      }

      const parentOrder = computeOrder(String(effectiveParentId), visited);
      return `${parentOrder}${tag.name}/`;
    }

    const bulkOps: any[] = [];

    for (const tag of allTags) {
      const isGroup = parentIdSet.has(String(tag._id));
      const effectiveParentId = nestedGroupIds.has(String(tag._id)) ? '' : (tag.parentId ? String(tag.parentId) : '');
      const order = computeOrder(String(tag._id));

      bulkOps.push({
        updateOne: {
          filter: { _id: tag._id },
          update: {
            $set: {
              isGroup,
              parentId: effectiveParentId,
              order,
            },
            $unset: { scopeBrandIds: '' },
          },
        },
      });
    }

    if (bulkOps.length > 0) {
      await Tags.bulkWrite(bulkOps);
      console.log(`Updated ${bulkOps.length} tag(s).`);
    }
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command();
