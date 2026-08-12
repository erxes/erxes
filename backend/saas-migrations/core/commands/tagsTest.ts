import * as dotenv from 'dotenv';

dotenv.config();

import {
  AnyBulkWriteOperation,
  Collection,
  Db,
  Document,
  MongoClient,
} from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  SOURCE_SUBDOMAIN,
  TARGET_SUBDOMAIN,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

if (!SOURCE_SUBDOMAIN || !TARGET_SUBDOMAIN) {
  throw new Error(
    'Environment variables SOURCE_SUBDOMAIN and TARGET_SUBDOMAIN must be set.',
  );
}

const TAGS_COLLECTION = 'tags';

// Legacy plugin-prefixed tag types → the content types the current tag schema
// serves. Unmapped types are copied unchanged and reported.
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

// Fields the current tag schema does not define.
const DROPPED_FIELDS = ['scopeBrandIds', 'totalObjectCount', '__typename'];

// Tags use `mongooseStringRandomId`, so `_id` is a string, not an ObjectId.
interface TagDocument extends Document {
  _id: string;
}

type TagNode = {
  _id: string;
  name: string;
  type: string;
  order: string;
  isGroup: boolean;
  parentId: string;
};

type TargetIndex = {
  byId: Map<string, TagNode>;
  byName: Map<string, TagNode>;
};

type MigrationPlan = {
  inserts: TagDocument[];
  parentUpdates: Map<string, string[]>;
  skippedById: number;
  skippedByName: number;
  promotedCount: number;
  unmappedTypes: Map<string, number>;
  warnings: string[];
};

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function toStr(value: unknown): string {
  return value ? String(value) : '';
}

function mapContentType(sourceType: string): string {
  return CONTENT_TYPE_MAP[sourceType] || sourceType;
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

async function indexTargetTags(
  tags: Collection<TagDocument>,
): Promise<TargetIndex> {
  const byId = new Map<string, TagNode>();
  const byName = new Map<string, TagNode>();

  const cursor = tags.find(
    {},
    {
      projection: {
        _id: 1,
        name: 1,
        type: 1,
        order: 1,
        isGroup: 1,
        parentId: 1,
      },
    },
  );

  for await (const doc of cursor) {
    const node: TagNode = {
      _id: String(doc._id),
      name: toStr(doc.name),
      type: toStr(doc.type),
      order: toStr(doc.order),
      isGroup: Boolean(doc.isGroup),
      parentId: toStr(doc.parentId),
    };

    byId.set(node._id, node);

    if (node.name) {
      byName.set(node.name, node);
    }
  }

  return { byId, byName };
}

function buildPlan(sourceDocs: TagDocument[], target: TargetIndex): MigrationPlan {
  const warnings: string[] = [];
  const unmappedTypes = new Map<string, number>();

  // A tag is a group when something points at it as a parent.
  const groupIds = new Set<string>();

  for (const doc of sourceDocs) {
    const parentId = toStr(doc.parentId);

    if (parentId) {
      groupIds.add(parentId);
    }
  }

  // The schema rejects a group nested inside a group, so a group that itself
  // has a parent is promoted to root — the same rule tags.ts applies.
  const promotedIds = new Set<string>();

  for (const doc of sourceDocs) {
    const id = String(doc._id);

    if (groupIds.has(id) && toStr(doc.parentId)) {
      promotedIds.add(id);
    }
  }

  // Keep the node each skipped tag resolves to, so its children can be
  // reparented instead of orphaned.
  const copied = new Map<string, TagDocument>();
  const resolvedToExisting = new Map<string, TagNode>();
  let skippedById = 0;
  let skippedByName = 0;

  for (const doc of sourceDocs) {
    const id = String(doc._id);
    const name = toStr(doc.name);
    const existingById = target.byId.get(id);

    if (existingById) {
      resolvedToExisting.set(id, existingById);
      skippedById++;
      continue;
    }

    const existingByName = name ? target.byName.get(name) : undefined;

    if (existingByName) {
      console.log(`  [SKIP] name "${name}" already exists in target`);
      resolvedToExisting.set(id, existingByName);
      skippedByName++;
      continue;
    }

    copied.set(id, doc);
  }

  // Promotion puts every group at root, so only leaves can carry a parent.
  const effectiveParentId = (doc: TagDocument): string =>
    promotedIds.has(String(doc._id)) ? '' : toStr(doc.parentId);

  const parentUpdates = new Map<string, string[]>();
  const resolvedParents = new Map<string, { id: string; order: string }>();

  for (const [id, doc] of copied) {
    const name = toStr(doc.name);
    const sourceParentId = effectiveParentId(doc);

    if (!sourceParentId) {
      resolvedParents.set(id, { id: '', order: '' });
      continue;
    }

    const copiedParent = copied.get(sourceParentId);

    if (copiedParent) {
      resolvedParents.set(id, {
        id: String(copiedParent._id),
        order: `${toStr(copiedParent.name)}/`,
      });
      continue;
    }

    const existingParent = resolvedToExisting.get(sourceParentId);

    if (!existingParent) {
      warnings.push(
        `Parent "${sourceParentId}" of "${name}" exists in neither source nor target; moved to root`,
      );
      resolvedParents.set(id, { id: '', order: '' });
      continue;
    }

    if (existingParent.parentId) {
      warnings.push(
        `Target parent "${existingParent.name}" is not a root group; "${name}" moved to root`,
      );
      resolvedParents.set(id, { id: '', order: '' });
      continue;
    }

    // `name` is globally unique in the schema, so a same-named target tag can
    // belong to another content type. Never nest a tag under a foreign type.
    const childType = mapContentType(toStr(doc.type));

    if (existingParent.type && childType && existingParent.type !== childType) {
      warnings.push(
        `Target tag "${existingParent.name}" is a "${existingParent.type}" tag; "${name}" ("${childType}") moved to root`,
      );
      resolvedParents.set(id, { id: '', order: '' });
      continue;
    }

    resolvedParents.set(id, {
      id: existingParent._id,
      order: existingParent.order || `${existingParent.name}/`,
    });

    parentUpdates.set(existingParent._id, [
      ...(parentUpdates.get(existingParent._id) || []),
      id,
    ]);
  }

  // relatedIds must mirror the tree that actually lands in the target.
  const childIds = new Map<string, string[]>();

  for (const [id] of copied) {
    const parentId = resolvedParents.get(id)?.id;

    if (parentId) {
      childIds.set(parentId, [...(childIds.get(parentId) || []), id]);
    }
  }

  const inserts: TagDocument[] = [];

  for (const [id, doc] of copied) {
    const name = toStr(doc.name);
    const parent = resolvedParents.get(id) || { id: '', order: '' };
    const sourceType = toStr(doc.type);

    if (sourceType && !CONTENT_TYPE_MAP[sourceType]) {
      unmappedTypes.set(sourceType, (unmappedTypes.get(sourceType) || 0) + 1);
    }

    const normalized: TagDocument = { ...doc };

    for (const field of DROPPED_FIELDS) {
      delete normalized[field];
    }

    normalized.type = mapContentType(sourceType);
    normalized.parentId = parent.id;
    normalized.order = `${parent.order}${name}/`;
    normalized.isGroup = groupIds.has(id);
    normalized.relatedIds = childIds.get(id) || [];

    inserts.push(normalized);
  }

  return {
    inserts,
    parentUpdates,
    skippedById,
    skippedByName,
    promotedCount: promotedIds.size,
    unmappedTypes,
    warnings,
  };
}

function reportPlan(plan: MigrationPlan): void {
  console.log(`\nPlanned inserts: ${plan.inserts.length}`);

  for (const tag of plan.inserts) {
    const kind = tag.isGroup ? 'GROUP' : 'TAG  ';
    console.log(`  [${kind}] ${tag.type} | ${tag.order}`);
  }

  if (plan.promotedCount > 0) {
    console.log(
      `\nPromoted ${plan.promotedCount} nested group(s) to root level.`,
    );
  }

  if (plan.parentUpdates.size > 0) {
    console.log(
      `Reparented onto ${plan.parentUpdates.size} existing target group(s).`,
    );
  }

  for (const [type, count] of plan.unmappedTypes) {
    console.log(
      `[WARN] No content type mapping for "${type}" (${count} tag(s)); copied unchanged.`,
    );
  }

  for (const warning of plan.warnings) {
    console.log(`[WARN] ${warning}`);
  }

  console.log(
    `\nSkipped: ${plan.skippedById} by id, ${plan.skippedByName} by name.`,
  );
}

async function applyPlan(
  targetTags: Collection<TagDocument>,
  plan: MigrationPlan,
): Promise<void> {
  if (plan.inserts.length > 0) {
    const { insertedCount } = await targetTags.insertMany(plan.inserts, {
      ordered: false,
    });

    console.log(`Inserted: ${insertedCount}`);
  } else {
    console.log('Nothing to insert.');
  }

  if (plan.parentUpdates.size === 0) {
    return;
  }

  // Existing target groups must list their new children and be marked groups,
  // matching what Tags.setRelatedTagIds maintains at runtime.
  const ops: AnyBulkWriteOperation<TagDocument>[] = [];

  for (const [parentId, newChildIds] of plan.parentUpdates) {
    ops.push({
      updateOne: {
        filter: { _id: parentId },
        update: {
          $set: { isGroup: true },
          $addToSet: { relatedIds: { $each: newChildIds } },
        },
      },
    });
  }

  const { modifiedCount } = await targetTags.bulkWrite(ops);
  console.log(`Updated ${modifiedCount} existing parent tag(s).`);
}

async function migrateTags(
  client: MongoClient,
  sourceDbName: string,
  targetDbName: string,
): Promise<void> {
  const sourceTags = client
    .db(sourceDbName)
    .collection<TagDocument>(TAGS_COLLECTION);
  const targetTags = client
    .db(targetDbName)
    .collection<TagDocument>(TAGS_COLLECTION);

  const sourceDocs = await sourceTags.find({}).toArray();
  console.log(`Source tags: ${sourceDocs.length}`);

  if (sourceDocs.length === 0) {
    console.log('No tags to migrate.');
    return;
  }

  const target = await indexTargetTags(targetTags);
  const plan = buildPlan(sourceDocs, target);

  reportPlan(plan);

  await applyPlan(targetTags, plan);
}

const command = async () => {
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);
  const client = new MongoClient(coreUrl);

  await client.connect();

  try {
    const coreDb = client.db(coreDbName);

    const sourceDbName = await resolveOrgDbName(
      coreDb,
      coreDbName,
      SOURCE_SUBDOMAIN,
    );
    const targetDbName = await resolveOrgDbName(
      coreDb,
      coreDbName,
      TARGET_SUBDOMAIN,
    );

    console.log(`Source: ${SOURCE_SUBDOMAIN} → ${sourceDbName}`);
    console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}`);

    await migrateTags(client, sourceDbName, targetDbName);
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
