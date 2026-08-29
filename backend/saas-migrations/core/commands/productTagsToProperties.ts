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
  SOURCE_SUBDOMAIN,
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

const FLAT_GROUP_KEY = '__flat__';
const FLAT_GROUP_NAME = 'Tags';
const FLAT_GROUP_CODE = 'product_tags';

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
  parentId?: string;
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

type TagNode = {
  _id: string;
  name: string;
  order: string;
  parentId: string;
  childIds: string[];
  depth: number;
  rootId: string;
};

type PlannedGroup = {
  key: string;
  name: string;
  code: string;
};

type PlannedField = {
  key: string;
  groupKey: string;
  name: string;
  code: string;
  options: string[];
};

type Placement = {
  fieldKey: string;
  value: string;
};

type Plan = {
  groups: Map<string, PlannedGroup>;
  fields: Map<string, PlannedField>;
  placements: Map<string, Placement>;
  unplaced: string[];
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function toStr(value: unknown): string {
  return value ? String(value).trim() : '';
}

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function uniqueCode(base: string, fallback: string, used: Set<string>): string {
  let code = slugify(base) || `tag_${fallback}`;

  if (used.has(code)) {
    code = `${code}_${fallback}`;
  }

  used.add(code);

  return code;
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

function buildTree(docs: TagDocument[]): Map<string, TagNode> {
  const nodes = new Map<string, TagNode>();

  for (const doc of docs) {
    const id = String(doc._id);

    nodes.set(id, {
      _id: id,
      name: toStr(doc.name),
      order: toStr(doc.order),
      parentId: '',
      childIds: [],
      depth: 0,
      rootId: id,
    });
  }

  for (const doc of docs) {
    const node = nodes.get(String(doc._id));
    const parentId = toStr(doc.parentId);

    if (!node || !parentId || parentId === node._id || !nodes.has(parentId)) {
      continue;
    }

    node.parentId = parentId;
    nodes.get(parentId)?.childIds.push(node._id);
  }

  for (const node of nodes.values()) {
    const seen = new Set<string>([node._id]);
    let current = node;

    while (current.parentId && !seen.has(current.parentId)) {
      seen.add(current.parentId);
      const parent = nodes.get(current.parentId);

      if (!parent) {
        break;
      }

      node.depth += 1;
      node.rootId = parent._id;
      current = parent;
    }
  }

  return nodes;
}

function ancestorPath(nodes: Map<string, TagNode>, node: TagNode): TagNode[] {
  const path: TagNode[] = [node];
  let current = node;

  while (current.parentId) {
    const parent = nodes.get(current.parentId);

    if (!parent || path.includes(parent)) {
      break;
    }

    path.unshift(parent);
    current = parent;
  }

  return path;
}

function buildPlan(nodes: Map<string, TagNode>, usedTagIds: Set<string>): Plan {
  const ordered = [...nodes.values()].sort(
    (a, b) => a.order.localeCompare(b.order) || a.name.localeCompare(b.name),
  );

  const groups = new Map<string, PlannedGroup>();
  const fields = new Map<string, PlannedField>();
  const placements = new Map<string, Placement>();
  const unplaced: string[] = [];
  const groupCodes = new Set<string>();
  const fieldCodes = new Set<string>();

  const ensureGroup = (key: string, name: string, id: string): void => {
    if (groups.has(key)) {
      return;
    }

    groups.set(key, {
      key,
      name,
      code:
        key === FLAT_GROUP_KEY
          ? FLAT_GROUP_CODE
          : uniqueCode(name, id, groupCodes),
    });
  };

  const ensureField = (
    key: string,
    groupKey: string,
    name: string,
    id: string,
  ): PlannedField => {
    const existing = fields.get(key);

    if (existing) {
      return existing;
    }

    const field: PlannedField = {
      key,
      groupKey,
      name,
      code:
        key === FLAT_GROUP_KEY
          ? FLAT_GROUP_CODE
          : uniqueCode(name, id, fieldCodes),
      options: [],
    };

    fields.set(key, field);

    return field;
  };

  const place = (node: TagNode, fieldKey: string, value: string): void => {
    const field = fields.get(fieldKey);

    if (!field || !value) {
      unplaced.push(node.name || node._id);
      return;
    }

    if (!field.options.includes(value)) {
      field.options.push(value);
    }

    placements.set(node._id, { fieldKey, value });
  };

  const flatFieldKey = (): string => {
    ensureGroup(FLAT_GROUP_KEY, FLAT_GROUP_NAME, FLAT_GROUP_KEY);
    ensureField(
      FLAT_GROUP_KEY,
      FLAT_GROUP_KEY,
      FLAT_GROUP_NAME,
      FLAT_GROUP_KEY,
    );

    return FLAT_GROUP_KEY;
  };

  const brandFieldKey = (root: TagNode): string => {
    const key = `root:${root._id}`;

    ensureGroup(root._id, root.name, root._id);
    ensureField(key, root._id, root.name, root._id);

    return key;
  };

  for (const node of ordered) {
    if (node.depth === 0) {
      if (node.childIds.length > 0) {
        ensureGroup(node._id, node.name, node._id);
      } else {
        place(node, flatFieldKey(), node.name);
      }

      continue;
    }

    if (node.depth === 1) {
      const root = nodes.get(node.rootId);

      if (!root) {
        place(node, flatFieldKey(), node.name);
        continue;
      }

      if (node.childIds.length > 0) {
        ensureGroup(root._id, root.name, root._id);
        ensureField(node._id, root._id, node.name, node._id);
      } else {
        place(node, brandFieldKey(root), node.name);
      }

      continue;
    }

    const path = ancestorPath(nodes, node);
    const owner = path[1];
    const root = nodes.get(node.rootId);
    const label = path
      .slice(2)
      .map((step) => step.name)
      .filter(Boolean)
      .join(' / ');

    if (owner && fields.has(owner._id)) {
      place(node, owner._id, label || node.name);
      continue;
    }

    place(node, root ? brandFieldKey(root) : flatFieldKey(), node.name);
  }

  for (const node of ordered) {
    if (placements.has(node._id) || !usedTagIds.has(node._id)) {
      continue;
    }

    if (fields.has(node._id)) {
      place(node, node._id, node.name);
      continue;
    }

    if (groups.has(node._id)) {
      place(node, brandFieldKey(node), node.name);
    }
  }

  return { groups, fields, placements, unplaced };
}

function reportPlan(plan: Plan, nodes: Map<string, TagNode>): void {
  console.log(
    `\nPlan: ${plan.groups.size} group(s), ${plan.fields.size} field(s), ${plan.placements.size} option(s) from ${nodes.size} tag(s).`,
  );

  for (const group of plan.groups.values()) {
    console.log(`  [GROUP] ${group.name} (${group.code})`);

    for (const field of plan.fields.values()) {
      if (field.groupKey !== group.key) {
        continue;
      }

      console.log(
        `    [FIELD] ${field.name} (${field.code}) — ${field.options.length} option(s)`,
      );
    }
  }

  for (const name of plan.unplaced) {
    console.log(`[WARN] could not place tag "${name}"`);
  }
}

async function syncGroups(
  groups: Collection<PropertyGroupDocument>,
  plan: Plan,
): Promise<Map<string, string>> {
  const idByKey = new Map<string, string>();
  let created = 0;
  let order = await nextOrder(groups, { contentType: PRODUCT_CONTENT_TYPE });

  for (const group of plan.groups.values()) {
    const existing = await groups.findOne({
      contentType: PRODUCT_CONTENT_TYPE,
      code: group.code,
    });

    if (existing) {
      idByKey.set(group.key, String(existing._id));
      continue;
    }

    const _id = generateId();
    idByKey.set(group.key, _id);
    created++;

    if (isDryRun) {
      continue;
    }

    const now = new Date();

    await groups.insertOne({
      _id,
      name: group.name,
      code: group.code,
      description: 'Migrated from product tags',
      contentType: PRODUCT_CONTENT_TYPE,
      contentTypeId: null,
      order,
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

    order += ORDER_GAP;
  }

  console.log(
    `Groups: ${created} created, ${plan.groups.size - created} reused.`,
  );

  return idByKey;
}

async function syncFields(
  fields: Collection<PropertyFieldDocument>,
  plan: Plan,
  groupIdByKey: Map<string, string>,
): Promise<Map<string, string>> {
  const idByKey = new Map<string, string>();
  let created = 0;
  let addedOptions = 0;
  const orderByGroup = new Map<string, number>();

  for (const field of plan.fields.values()) {
    const groupId = groupIdByKey.get(field.groupKey);

    if (!groupId) {
      console.log(`[WARN] no group for field "${field.name}"; skipped`);
      continue;
    }

    const options: FieldOption[] = field.options.map((value) => ({
      label: value,
      value,
    }));

    const existing = await fields.findOne({
      contentType: PRODUCT_CONTENT_TYPE,
      code: field.code,
    });

    if (existing) {
      idByKey.set(field.key, String(existing._id));

      const known = new Set(
        (existing.options || []).map((option) => option.value),
      );
      const added = options.filter((option) => !known.has(option.value));
      addedOptions += added.length;

      if (added.length > 0 && !isDryRun) {
        await fields.updateOne(
          { _id: existing._id },
          {
            $set: {
              options: [...(existing.options || []), ...added],
              updatedAt: new Date(),
            },
          },
        );
      }

      continue;
    }

    const _id = generateId();
    idByKey.set(field.key, _id);
    created++;

    if (isDryRun) {
      continue;
    }

    const order =
      orderByGroup.get(groupId) ?? (await nextOrder(fields, { groupId }));
    orderByGroup.set(groupId, order + ORDER_GAP);
    const now = new Date();

    await fields.insertOne({
      _id,
      name: field.name,
      code: field.code,
      groupId,
      contentType: PRODUCT_CONTENT_TYPE,
      type: FIELD_TYPE,
      order,
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
  }

  console.log(
    `Fields: ${created} created, ${
      plan.fields.size - created
    } reused, ${addedOptions} option(s) added to existing fields.`,
  );

  return idByKey;
}

async function fillProductValues(
  products: Collection<ProductDocument>,
  plan: Plan,
  fieldIdByKey: Map<string, string>,
): Promise<number> {
  const valueByTagId = new Map<string, { fieldId: string; value: string }>();

  for (const [tagId, placement] of plan.placements) {
    const fieldId = fieldIdByKey.get(placement.fieldKey);

    if (fieldId) {
      valueByTagId.set(tagId, { fieldId, value: placement.value });
    }
  }

  const tagIds = [...valueByTagId.keys()];

  if (tagIds.length === 0) {
    return 0;
  }

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
    const valuesByField = new Map<string, Set<string>>();

    for (const tagId of product.tagIds || []) {
      const placed = valueByTagId.get(String(tagId));

      if (!placed) {
        continue;
      }

      const current = product.propertiesData?.[placed.fieldId];
      const values =
        valuesByField.get(placed.fieldId) ||
        new Set<string>(
          Array.isArray(current) ? current.map((value) => String(value)) : [],
        );

      values.add(placed.value);
      valuesByField.set(placed.fieldId, values);
    }

    if (valuesByField.size === 0) {
      continue;
    }

    const update: Record<string, string[]> = {};

    for (const [fieldId, values] of valuesByField) {
      update[`propertiesData.${fieldId}`] = [...values];
    }

    ops.push({
      updateOne: { filter: { _id: product._id }, update: { $set: update } },
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
    console.log(`Would remove ${tagIds.length} tag(s) from the target org.`);
    return;
  }

  const { modifiedCount } = await products.updateMany(
    { tagIds: { $in: tagIds } },
    { $pull: { tagIds: { $in: tagIds } } },
  );
  const { deletedCount } = await tags.deleteMany({ _id: { $in: tagIds } });

  console.log(
    `Removed ${deletedCount} tag(s) from the target org; cleared tagIds on ${modifiedCount} product(s).`,
  );
}

const command = async () => {
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);
  const client = new MongoClient(coreUrl);

  await client.connect();

  try {
    const coreDb = client.db(coreDbName);

    const targetDbName = await resolveOrgDbName(
      coreDb,
      coreDbName,
      TARGET_SUBDOMAIN,
    );
    const sourceDbName = SOURCE_SUBDOMAIN
      ? await resolveOrgDbName(coreDb, coreDbName, SOURCE_SUBDOMAIN)
      : targetDbName;

    console.log(
      `Tags from: ${SOURCE_SUBDOMAIN || TARGET_SUBDOMAIN} → ${sourceDbName}`,
    );
    console.log(`Writing to: ${TARGET_SUBDOMAIN} → ${targetDbName}`);

    if (isDryRun) {
      console.log('DRY_RUN=true — no writes will be made.');
    }

    const db = client.db(targetDbName);
    const tags = db.collection<TagDocument>('tags');
    const groups = db.collection<PropertyGroupDocument>('properties_groups');
    const fields = db.collection<PropertyFieldDocument>('properties_fields');
    const products = db.collection<ProductDocument>('products');

    const sourceTags = await client
      .db(sourceDbName)
      .collection<TagDocument>('tags')
      .find({ type: { $in: SOURCE_TAG_TYPES } })
      .toArray();

    console.log(`Source tags: ${sourceTags.length}`);

    if (sourceTags.length === 0) {
      console.log('No product tags to migrate.');
      return;
    }

    const nodes = buildTree(sourceTags);
    const allTagIds = [...nodes.keys()];
    const usedTagIds = new Set<string>(
      (await products.distinct('tagIds', { tagIds: { $in: allTagIds } })).map(
        (tagId) => String(tagId),
      ),
    );

    const plan = buildPlan(nodes, usedTagIds);

    reportPlan(plan, nodes);

    const groupIdByKey = await syncGroups(groups, plan);
    const fieldIdByKey = await syncFields(fields, plan, groupIdByKey);

    const updated = await fillProductValues(products, plan, fieldIdByKey);
    console.log(`Products updated: ${updated}`);

    if (removeSourceTags) {
      await removeTags(tags, products, allTagIds);
    } else {
      console.log(
        `Tags in ${targetDbName} kept. Re-run with REMOVE_SOURCE_TAGS=true to delete them.`,
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
