import * as dotenv from 'dotenv';

dotenv.config();

import { AnyBulkWriteOperation, Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const CONTENT_TYPE_MAP: Record<string, string> = {
  'tickets:ticket': 'frontline:ticket',
  'inbox:conversation': 'frontline:conversation',
  'contacts:customer': 'core:customer',
  'contacts:company': 'core:company',
  'products:product': 'core:product',
  'forms:form': 'core:form',
  'deals:deal': 'sales:deal',
  'automations:automation': 'core:automation',
};

type TagDocument = {
  _id: string;
  name?: string;
  parentId?: string;
  isGroup?: boolean;
};

const client = new MongoClient(MONGO_URL);

let db: Db;
let Tags: Collection<TagDocument>;

const retypeLegacyTags = async () => {
  const ops: AnyBulkWriteOperation<TagDocument>[] = Object.entries(
    CONTENT_TYPE_MAP,
  ).map(([legacyType, contentType]) => ({
    updateMany: {
      filter: { type: legacyType },
      update: { $set: { type: contentType } },
    },
  }));

  const { modifiedCount } = await Tags.bulkWrite(ops, { ordered: false });

  console.log(`Retyped ${modifiedCount} legacy-typed tag(s).`);
};

const restructureTags = async () => {
  const allTags = await Tags.find(
    {},
    { projection: { _id: 1, name: 1, parentId: 1, isGroup: 1 } },
  ).toArray();

  const groupIds = new Set<string>([
    ...allTags.map((tag) => String(tag.parentId || '')).filter(Boolean),
    ...allTags.filter((tag) => tag.isGroup).map((tag) => String(tag._id)),
  ]);

  const nestedGroupIds = new Set<string>(
    allTags
      .filter((tag) => groupIds.has(String(tag._id)) && tag.parentId)
      .map((tag) => String(tag._id)),
  );

  if (nestedGroupIds.size > 0) {
    console.log(
      `Promoting ${nestedGroupIds.size} nested group(s) to root level.`,
    );
  }

  const tagMap = new Map<string, TagDocument>(
    allTags.map((tag) => [String(tag._id), tag]),
  );

  const effectiveParentId = (tagId: string): string => {
    const tag = tagMap.get(tagId);

    if (!tag?.parentId || nestedGroupIds.has(tagId)) {
      return '';
    }

    return tagMap.has(String(tag.parentId)) ? String(tag.parentId) : '';
  };

  const computeOrder = (tagId: string): string => {
    const tag = tagMap.get(tagId);
    const parentId = effectiveParentId(tagId);
    const parent = parentId ? tagMap.get(parentId) : undefined;

    return parent ? `${parent.name}/${tag?.name}/` : `${tag?.name}/`;
  };

  const ops: AnyBulkWriteOperation<TagDocument>[] = allTags.map((tag) => {
    const tagId = String(tag._id);

    return {
      updateOne: {
        filter: { _id: tag._id },
        update: {
          $set: {
            isGroup: groupIds.has(tagId),
            parentId: effectiveParentId(tagId),
            order: computeOrder(tagId),
          },
          $unset: { scopeBrandIds: '' },
        },
      },
    };
  });

  if (ops.length > 0) {
    await Tags.bulkWrite(ops, { ordered: false });
  }

  console.log(`Updated ${ops.length} tag(s).`);
};

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Tags = db.collection<TagDocument>('tags');

  try {
    await retypeLegacyTags();
    await restructureTags();
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command();
