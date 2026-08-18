import * as dotenv from 'dotenv';

dotenv.config();

import { MongoClient } from 'mongodb';
import type {
  AnyBulkWriteOperation,
  Collection,
  Db,
  Document,
  Filter,
} from 'mongodb';

import { generateId } from '../../content/wordpress/generateId';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  TARGET_SUBDOMAIN,
  DRY_RUN,
  REMOVE_SOURCE_TAGS,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

if (!TARGET_SUBDOMAIN) {
  throw new Error('Environment variable TARGET_SUBDOMAIN must be set.');
}

const isDryRun = DRY_RUN === 'true';
const removeSourceTags = REMOVE_SOURCE_TAGS === 'true';

const PRODUCT_CONTENT_TYPE = 'core:product';
const SOURCE_TAG_TYPES = ['core:product', 'products:product'];

const GROUP_CODE = 'product_tags';
const GROUP_NAME = 'Tags';
const FIELD_CODE = 'product_tags';
const FIELD_NAME = 'Tags';
const FIELD_TYPE = 'multiSelect';

const ORDER_GAP = 1000;
const BATCH_SIZE = 1000;

type FieldOption = {
  label: string;
  value: string;
};

type TagDocument = {
  _id: string;
  name?: string;
  type?: string;
  isGroup?: boolean;
  order?: string;
};

type PropertyGroupDocument = {
  _id: string;
  name: string;
  code: string;
  description?: string;
  contentType: string;
  contentTypeId?: string | null;
  order?: number;
  logics?: unknown[];
  configs?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
};

type PropertyFieldDocument = {
  _id: string;
  name: string;
  code: string;
  groupId: string;
  contentType: string;
  type: string;
  order?: number;
  logics?: unknown[];
  validations?: Record<string, unknown>;
  configs?: Record<string, unknown>;
  options?: FieldOption[];
  isVisible?: boolean;
  isVisibleToCreate?: boolean;
  isRequired?: boolean;
  isVisibleInCard?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type ProductDocument = {
  _id: string;
  tagIds?: string[];
  propertiesData?: Record<string, unknown>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function toStr(value: unknown): string {
  return value ? String(value) : '';
}

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

async function resolveOrgDbName(
  coreDb: Db,
  coreDbName: string,
  subdomain: string,
): Promise<string> {
  const org = await coreDb
    .collection('organizations')
    .findOne({ subdomain }, { projection: { _id: 1 } });

  if (!org) {
    throw new Error(
      `Organization "${subdomain}" not found in ${coreDbName}.organizations`,
    );
  }

  return `erxes_${org._id}`;
}

async function nextOrder<TSchema extends Document & { order?: number }>(
  collection: Collection<TSchema>,
  filter: Filter<TSchema>,
): Promise<number> {
  const [last] = await collection
    .find(filter, { projection: { order: 1 }, sort: { order: -1 }, limit: 1 })
    .toArray();

  const lastOrder = Number(last?.order);

  return Number.isFinite(lastOrder) ? lastOrder + ORDER_GAP : ORDER_GAP;
}

async function ensureGroup(
  groups: Collection<PropertyGroupDocument>,
): Promise<string> {
  const existing = await groups.findOne({
    contentType: PRODUCT_CONTENT_TYPE,
    code: GROUP_CODE,
  });

  if (existing) {
    console.log(`Group: reusing "${existing.name}" (${existing._id})`);
    return String(existing._id);
  }

  const _id = generateId();
  const now = new Date();

  console.log(`Group: creating "${GROUP_NAME}" (${_id})`);

  if (isDryRun) {
    return _id;
  }

  await groups.insertOne({
    _id,
    name: GROUP_NAME,
    code: GROUP_CODE,
    description: 'Migrated from product tags',
    contentType: PRODUCT_CONTENT_TYPE,
    contentTypeId: null,
    order: await nextOrder(groups, { contentType: PRODUCT_CONTENT_TYPE }),
    logics: [],
    configs: {
      alwaysOpen: true,
      isMultiple: false,
      isVisible: true,
      isVisibleInDetail: true,
    },
    createdAt: now,
    updatedAt: now,
  });

  return _id;
}

async function ensureField(
  fields: Collection<PropertyFieldDocument>,
  groupId: string,
  options: FieldOption[],
): Promise<string> {
  const existing = await fields.findOne({
    contentType: PRODUCT_CONTENT_TYPE,
    code: FIELD_CODE,
  });

  if (existing) {
    const known = new Set(
      (existing.options || []).map((option) => option.value),
    );
    const added = options.filter((option) => !known.has(option.value));

    console.log(
      `Field: reusing "${existing.name}" (${existing._id}); ${added.length} new option(s)`,
    );

    if (added.length > 0 && !isDryRun) {
      await fields.updateOne(
        { _id: existing._id },
        {
          $push: { options: { $each: added } },
          $set: { updatedAt: new Date() },
        },
      );
    }

    return String(existing._id);
  }

  const _id = generateId();
  const now = new Date();

  console.log(
    `Field: creating "${FIELD_NAME}" (${_id}) with ${options.length} option(s)`,
  );

  if (isDryRun) {
    return _id;
  }

  await fields.insertOne({
    _id,
    name: FIELD_NAME,
    code: FIELD_CODE,
    groupId,
    contentType: PRODUCT_CONTENT_TYPE,
    type: FIELD_TYPE,
    order: await nextOrder(fields, { groupId }),
    logics: [],
    validations: {},
    configs: {},
    options,
    isVisible: true,
    isVisibleToCreate: true,
    isRequired: false,
    isVisibleInCard: false,
    createdAt: now,
    updatedAt: now,
  });

  return _id;
}

function buildOptions(tags: TagDocument[]): FieldOption[] {
  const options: FieldOption[] = [];
  const seen = new Set<string>();

  for (const tag of tags) {
    const name = toStr(tag.name);

    if (!name || seen.has(name)) {
      continue;
    }

    seen.add(name);
    options.push({ label: name, value: name });
  }

  return options;
}

async function fillProductValues(
  products: Collection<ProductDocument>,
  fieldId: string,
  nameByTagId: Map<string, string>,
): Promise<number> {
  const tagIds = [...nameByTagId.keys()];
  const path = `propertiesData.${fieldId}`;

  const cursor = products.find(
    { tagIds: { $in: tagIds } },
    { projection: { tagIds: 1, propertiesData: 1 } },
  );

  let ops: AnyBulkWriteOperation<ProductDocument>[] = [];
  let updated = 0;

  const flush = async (): Promise<void> => {
    if (ops.length === 0) {
      return;
    }

    if (!isDryRun) {
      await products.bulkWrite(ops);
    }

    updated += ops.length;
    ops = [];
  };

  for await (const product of cursor) {
    const current = product.propertiesData?.[fieldId];
    const values = new Set<string>(
      Array.isArray(current) ? current.map((value) => String(value)) : [],
    );

    for (const tagId of product.tagIds || []) {
      const name = nameByTagId.get(String(tagId));

      if (name) {
        values.add(name);
      }
    }

    if (values.size === 0) {
      continue;
    }

    ops.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { [path]: [...values] } },
      },
    });

    if (ops.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  return updated;
}

async function removeTags(
  tags: Collection<TagDocument>,
  products: Collection<ProductDocument>,
  tagIds: string[],
): Promise<void> {
  if (isDryRun) {
    console.log(`Would remove ${tagIds.length} source tag(s).`);
    return;
  }

  const { modifiedCount } = await products.updateMany(
    { tagIds: { $in: tagIds } },
    { $pull: { tagIds: { $in: tagIds } } },
  );
  const { deletedCount } = await tags.deleteMany({ _id: { $in: tagIds } });

  console.log(
    `Removed ${deletedCount} source tag(s); cleared tagIds on ${modifiedCount} product(s).`,
  );
}

const command = async () => {
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);
  const client = new MongoClient(coreUrl);

  await client.connect();

  try {
    const targetDbName = await resolveOrgDbName(
      client.db(coreDbName),
      coreDbName,
      TARGET_SUBDOMAIN,
    );

    console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}`);

    if (isDryRun) {
      console.log('DRY_RUN=true — no writes will be made.\n');
    }

    const db = client.db(targetDbName);
    const tags = db.collection<TagDocument>('tags');
    const groups = db.collection<PropertyGroupDocument>('properties_groups');
    const fields = db.collection<PropertyFieldDocument>('properties_fields');
    const products = db.collection<ProductDocument>('products');

    const sourceTags = await tags
      .find({ type: { $in: SOURCE_TAG_TYPES }, isGroup: { $ne: true } })
      .sort({ order: 1 })
      .toArray();

    console.log(`Source tags: ${sourceTags.length}`);

    if (sourceTags.length === 0) {
      console.log('No product tags to migrate.');
      return;
    }

    const nameByTagId = new Map<string, string>();

    for (const tag of sourceTags) {
      const name = toStr(tag.name);

      if (name) {
        nameByTagId.set(String(tag._id), name);
      }
    }

    const options = buildOptions(sourceTags);

    const groupId = await ensureGroup(groups);
    const fieldId = await ensureField(fields, groupId, options);

    const updated = await fillProductValues(products, fieldId, nameByTagId);
    console.log(`Products updated: ${updated}`);

    if (removeSourceTags) {
      await removeTags(tags, products, [...nameByTagId.keys()]);
    } else {
      console.log(
        'Source tags kept. Re-run with REMOVE_SOURCE_TAGS=true to delete them.',
      );
    }
  } finally {
    await client.close();
    console.log(`\nProcess finished at: ${new Date().toISOString()}`);
  }
};

command()
  .then(() => process.exit())
  .catch((e) => {
    console.error(`Error: ${getErrorMessage(e)}`);
    process.exit(1);
  });
