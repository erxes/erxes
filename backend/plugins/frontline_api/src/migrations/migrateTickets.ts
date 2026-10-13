import * as dotenv from 'dotenv';

dotenv.config();

import { toPropertyGroupKey } from 'erxes-api-shared/core-modules';
import {
  AnyBulkWriteOperation,
  Collection,
  Db,
  Document,
  MongoClient,
} from 'mongodb';
import { nanoid } from 'nanoid';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  DRY_RUN,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const STATIC_CHANNEL_ID = process.env.STATIC_CHANNEL_ID || '9H8jJQrCbXdWb4FoX';

const isDryRun = DRY_RUN !== 'false';
const TICKET_CONTENT_TYPE = 'frontline:ticket';
const BATCH_SIZE = 1000;

const client = new MongoClient(MONGO_URL);
let db: Db;

let OLD_PIPELINES: Collection<StringIdDocument>;
let OLD_STAGES: Collection<StringIdDocument>;
let OLD_TICKETS: Collection<StringIdDocument>;
let OLD_COMMENTS: Collection<StringIdDocument>;
let OLD_CHECKLISTS: Collection<StringIdDocument>;
let OLD_CHECKLIST_ITEMS: Collection<StringIdDocument>;

let NEW_PIPELINES: Collection<StringIdDocument>;
let NEW_STATUSES: Collection<StringIdDocument>;
let NEW_TICKETS: Collection<StringIdDocument>;
let NEW_NOTES: Collection<StringIdDocument>;
let NEW_ACTIVITIES: Collection;
let PROPERTY_FIELDS: Collection;
let PROPERTY_GROUPS: Collection;

const STATUS_TYPES = {
  NEW: 1,
  OPEN: 2,
  IN_PROGRESS: 3,
  RESOLVED: 4,
  CLOSED: 5,
  CANCELLED: 6,
} as const;

const STATUS_COLORS: Record<number, string> = {
  1: '#3B82F6',
  2: '#F59E0B',
  3: '#FBBF24',
  4: '#10B981',
  5: '#6B7280',
  6: '#EF4444',
};

const VALID_TICKET_TYPES = new Set([
  'bug',
  'ticket',
  'feature',
  'question',
  'incident',
]);

type StringIdDocument = Document & { _id: string };

const statusTypeById = new Map<string, number>();

type PropertyContext = {
  fieldsById: Map<string, Document>;
  groupsById: Map<string, Document>;
  misplacedFieldIds: Set<string>;
  unknownFieldIds: Set<string>;
};

async function writeBulk<T extends Document>(
  collection: Collection<T>,
  operations: AnyBulkWriteOperation<T>[],
  label: string,
) {
  if (!operations.length || isDryRun) {
    return;
  }

  await collection.bulkWrite(operations, { ordered: false });
  console.log(`💾 Wrote batch of ${operations.length} ${label}`);
}

function probabilityToStatusType(probability?: string): number {
  switch (probability?.toLowerCase().trim()) {
    case 'won':
    case 'done':
      return STATUS_TYPES.CLOSED;
    case 'lost':
      return STATUS_TYPES.CANCELLED;
    case 'resolved':
      return STATUS_TYPES.RESOLVED;
    default: {
      const pct = parseInt((probability ?? '').replace('%', ''), 10);
      if (!isNaN(pct)) {
        if (pct <= 10) return STATUS_TYPES.NEW;
        if (pct <= 30) return STATUS_TYPES.OPEN;
        if (pct <= 80) return STATUS_TYPES.IN_PROGRESS;
        if (pct <= 99) return STATUS_TYPES.RESOLVED;
      }
      return STATUS_TYPES.IN_PROGRESS;
    }
  }
}

function positionToStatusType(pos: number, total: number): number {
  if (total === 1) return STATUS_TYPES.IN_PROGRESS;
  if (pos === 0) return STATUS_TYPES.NEW;
  if (pos === 1) return STATUS_TYPES.OPEN;
  if (pos === total - 1) return STATUS_TYPES.CLOSED;
  if (pos === total - 2) return STATUS_TYPES.RESOLVED;
  return STATUS_TYPES.IN_PROGRESS;
}

function probabilityToNumber(probability?: string): number | undefined {
  if (!probability) return undefined;
  const lower = probability.toLowerCase().trim();
  if (['won', 'done', 'resolved'].includes(lower)) return 100;
  if (lower === 'lost') return 0;
  const n = parseInt(probability.replace('%', ''), 10);
  return isNaN(n) ? undefined : n;
}

function mapPriority(priority?: string): number {
  switch (priority?.toLowerCase().trim()) {
    case 'low':
    case 'minor':
      return 1;
    case 'normal':
    case 'medium':
      return 2;
    case 'high':
    case 'major':
      return 3;
    case 'critical':
    case 'urgent':
      return 4;
    default:
      return 0;
  }
}

function normalizeTicketType(type?: string): string {
  const lower = (type ?? '').toLowerCase();
  return VALID_TICKET_TYPES.has(lower) ? lower : 'ticket';
}

async function loadExistingIds(
  col: Collection<StringIdDocument>,
): Promise<Set<string>> {
  const docs = await col.find({}, { projection: { _id: 1 } }).toArray();
  return new Set(docs.map((d) => d._id.toString()));
}

const toList = (value: unknown): unknown =>
  typeof value === 'string' ? value.split(',') : value;

const toLowercase = (value: unknown): unknown =>
  typeof value === 'string' ? value.toLowerCase() : value;

function parsePropertyValue(field: Document, value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }

  switch (field.type) {
    case 'multiSelect':
    case 'check': {
      const list = toList(value);
      return Array.isArray(list) ? list.map(toLowercase) : list;
    }
    case 'list':
      return toList(value);
    case 'select':
    case 'radio':
      return Array.isArray(value)
        ? value.join(',').toLowerCase()
        : String(value).toLowerCase();
    case 'date':
      return typeof value === 'string' ? new Date(value) : value;
    case 'number': {
      const number = Number(value);
      return isNaN(number) ? value : number;
    }
    default:
      return value;
  }
}

function trackField(context: PropertyContext, field: Document) {
  if (field.contentType !== TICKET_CONTENT_TYPE) {
    context.misplacedFieldIds.add(String(field._id));
  }
}

function toPropertiesData(
  customFieldsData: Document[] | undefined,
  context: PropertyContext,
): Record<string, unknown> | undefined {
  const propertiesData: Record<string, unknown> = {};

  for (const customField of customFieldsData || []) {
    const fieldId = customField?.field;

    if (!fieldId) continue;

    const rawValue = customField.value ?? customField.stringValue;
    const field = context.fieldsById.get(fieldId);

    if (field) {
      trackField(context, field);

      const value = parsePropertyValue(field, rawValue);

      if (value !== null && value !== undefined && value !== '') {
        propertiesData[fieldId] = value;
      }

      continue;
    }

    const group = context.groupsById.get(fieldId);

    if (group?.configs?.isMultiple && Array.isArray(rawValue)) {
      const rows: Record<string, unknown>[] = [];

      for (const row of rawValue) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) continue;

        const parsedRow: Record<string, unknown> = {};

        for (const [nestedFieldId, nestedValue] of Object.entries(row)) {
          const nestedField = context.fieldsById.get(nestedFieldId);

          if (!nestedField) {
            context.unknownFieldIds.add(nestedFieldId);
            continue;
          }

          trackField(context, nestedField);

          const value = parsePropertyValue(nestedField, nestedValue);

          if (value !== null && value !== undefined && value !== '') {
            parsedRow[nestedFieldId] = value;
          }
        }

        if (Object.keys(parsedRow).length) {
          rows.push({ ...parsedRow, _id: nanoid() });
        }
      }

      if (rows.length) {
        propertiesData[toPropertyGroupKey(fieldId)] = rows;
      }

      continue;
    }

    context.unknownFieldIds.add(fieldId);
  }

  return Object.keys(propertiesData).length ? propertiesData : undefined;
}

function toNaivePropertiesData(
  customFieldsData: Document[] | undefined,
): Record<string, unknown> | undefined {
  if (!Array.isArray(customFieldsData) || !customFieldsData.length) {
    return undefined;
  }

  const propertiesData: Record<string, unknown> = {};

  for (const customField of customFieldsData) {
    if (customField?.field) {
      propertiesData[customField.field] =
        customField.value ?? customField.stringValue;
    }
  }

  return propertiesData;
}

const isEmptyObject = (value: unknown): boolean =>
  !value ||
  (typeof value === 'object' && Object.keys(value as object).length === 0);

const isSameJson = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

async function loadPropertyContext(): Promise<PropertyContext> {
  const fields = await PROPERTY_FIELDS.find({}).toArray();
  const groups = await PROPERTY_GROUPS.find({}).toArray();

  return {
    fieldsById: new Map(fields.map((field) => [String(field._id), field])),
    groupsById: new Map(groups.map((group) => [String(group._id), group])),
    misplacedFieldIds: new Set(),
    unknownFieldIds: new Set(),
  };
}

function buildTicketFields(
  doc: Document,
  propertyContext: PropertyContext,
): Document {
  const statusType = statusTypeById.get(String(doc.stageId));
  const assignedMembers: string[] = doc.assignedUserIds || [];

  return {
    priority: mapPriority(doc.priority),
    statusType: statusType ?? 0,
    assigneeId: assignedMembers[0],
    assignedMembers,
    departmentId: doc.departmentIds?.[0],
    branchId: doc.branchIds?.[0],
    propertiesData: toPropertiesData(doc.customFieldsData, propertyContext),
  };
}

function buildRepair(
  existing: Document,
  doc: Document,
  fields: Document,
): Document {
  const set: Document = {};

  if (!existing.priority && fields.priority) {
    set.priority = fields.priority;
  }

  if (!existing.statusType && fields.statusType) {
    set.statusType = fields.statusType;
  }

  if (!existing.assignedMembers?.length && fields.assignedMembers.length) {
    set.assignedMembers = fields.assignedMembers;
  }

  if (!existing.departmentId && fields.departmentId) {
    set.departmentId = fields.departmentId;
  }

  if (!existing.branchId && fields.branchId) {
    set.branchId = fields.branchId;
  }

  const untouchedProperties =
    isEmptyObject(existing.propertiesData) ||
    isSameJson(
      existing.propertiesData,
      toNaivePropertiesData(doc.customFieldsData),
    );

  if (
    untouchedProperties &&
    fields.propertiesData &&
    !isSameJson(existing.propertiesData, fields.propertiesData)
  ) {
    set.propertiesData = fields.propertiesData;
  }

  return set;
}

async function migratePipelines(): Promise<void> {
  console.log('\n🚀 Step 1 — tickets_pipelines → frontline_tickets_pipelines');
  console.log(`   Channel  : ${STATIC_CHANNEL_ID}`);

  const existingIds = await loadExistingIds(NEW_PIPELINES);
  console.log(`📋 Existing : ${existingIds.size}`);

  const cursor = OLD_PIPELINES.find({ type: 'ticket' }).batchSize(BATCH_SIZE);

  let bulk: AnyBulkWriteOperation<StringIdDocument>[] = [];
  let migratedCount = 0;
  let skippedCount = 0;

  for await (const doc of cursor) {
    if (!doc) continue;

    if (existingIds.has(doc._id.toString())) {
      skippedCount++;
      continue;
    }

    bulk.push({
      insertOne: {
        document: {
          _id: doc._id,
          name: doc.name || 'Untitled Pipeline',
          channelId: STATIC_CHANNEL_ID,
          userId: doc.userId,
          order: doc.order ?? 0,
          state: doc.status === 'archived' ? 'archived' : 'active',
          visibility: doc.visibility || 'public',
          memberIds: doc.memberIds || [],
          tagId: doc.tagId,
          isCheckDate: doc.isCheckDate,
          isCheckUser: doc.isCheckUser,
          isCheckDepartment: doc.isCheckDepartment,
          isCheckBranch: doc.isCheckBranch,
          isHideName: doc.isHideName,
          excludeCheckUserIds: doc.excludeCheckUserIds || [],
          numberConfig: doc.numberConfig,
          numberSize: doc.numberSize,
          nameConfig: doc.nameConfig,
          lastNum: doc.lastNum,
          departmentIds: doc.departmentIds || [],
          branchIds: doc.branchIds || [],
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.modifiedAt || doc.createdAt || new Date(),
        },
      },
    });

    migratedCount++;

    if (bulk.length >= BATCH_SIZE) {
      await writeBulk(NEW_PIPELINES, bulk, 'pipeline(s)');
      bulk = [];
    }
  }

  await writeBulk(NEW_PIPELINES, bulk, 'pipeline(s)');

  console.log(`✅ Migrated : ${migratedCount}  |  Skipped : ${skippedCount}`);
}

async function migrateStatuses(): Promise<void> {
  console.log(
    '\n🚀 Step 2 — tickets_stages → frontline_tickets_pipeline_statuses',
  );

  const existingStatuses = await NEW_STATUSES.find(
    {},
    { projection: { _id: 1, type: 1 } },
  ).toArray();

  for (const status of existingStatuses) {
    if (typeof status.type === 'number') {
      statusTypeById.set(String(status._id), status.type);
    }
  }

  const existingIds = new Set(existingStatuses.map((s) => String(s._id)));
  console.log(`📋 Existing : ${existingIds.size}`);

  const allStages = await OLD_STAGES.find({ type: 'ticket' })
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  console.log(`📋 Source   : ${allStages.length} stage(s)`);

  const byPipeline = new Map<string, Document[]>();
  for (const stage of allStages) {
    const pid = stage.pipelineId?.toString() || '';
    const group = byPipeline.get(pid) ?? [];
    group.push(stage);
    byPipeline.set(pid, group);
  }

  let bulk: AnyBulkWriteOperation<StringIdDocument>[] = [];
  let migratedCount = 0;
  let skippedCount = 0;

  for (const [, stages] of byPipeline) {
    const total = stages.length;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];

      if (existingIds.has(stage._id.toString())) {
        skippedCount++;
        continue;
      }

      if (!stage.pipelineId) {
        console.log(
          `⏭️  No pipelineId — skipping stage "${stage.name}" (${stage._id})`,
        );
        skippedCount++;
        continue;
      }

      const statusType = stage.probability
        ? probabilityToStatusType(stage.probability)
        : positionToStatusType(i, total);

      statusTypeById.set(String(stage._id), statusType);

      bulk.push({
        insertOne: {
          document: {
            _id: stage._id,
            name: stage.name || 'Untitled Status',
            pipelineId: stage.pipelineId,
            type: statusType,
            order: stage.order ?? i,
            color: stage.color || STATUS_COLORS[statusType] || '#4F46E5',
            probability: probabilityToNumber(stage.probability),
            visibilityType: stage.visibility || 'public',
            memberIds: stage.memberIds || [],
            canMoveMemberIds: stage.canMoveMemberIds || [],
            canEditMemberIds: stage.canEditMemberIds || [],
            departmentIds: stage.departmentIds || [],
            state: stage.status === 'archived' ? 'archived' : 'active',
            createdAt: stage.createdAt || new Date(),
            updatedAt: stage.modifiedAt || stage.createdAt || new Date(),
          },
        },
      });

      migratedCount++;

      if (bulk.length >= BATCH_SIZE) {
        await writeBulk(NEW_STATUSES, bulk, 'status(es)');
        bulk = [];
      }
    }
  }

  await writeBulk(NEW_STATUSES, bulk, 'status(es)');

  console.log(`✅ Migrated : ${migratedCount}  |  Skipped : ${skippedCount}`);
}

async function migrateTickets(): Promise<void> {
  console.log(
    '\n🚀 Step 3 — tickets → frontline_tickets + frontline_ticket_activities',
  );

  const allStages = await OLD_STAGES.find(
    {},
    { projection: { _id: 1, pipelineId: 1 } },
  ).toArray();
  const stageToPipeline = new Map<string, string>(
    allStages.map((s) => [s._id.toString(), s.pipelineId?.toString() || '']),
  );

  const propertyContext = await loadPropertyContext();

  const cursor = OLD_TICKETS.find({ type: { $ne: 'deal' } }).batchSize(
    BATCH_SIZE,
  );

  let batch: Document[] = [];
  let migratedCount = 0;
  let repairedCount = 0;
  let unchangedCount = 0;
  const repairedFields: Record<string, number> = {};

  const flush = async () => {
    if (!batch.length) return;

    const existingTickets = await NEW_TICKETS.find(
      { _id: { $in: batch.map((doc) => doc._id) } },
      {
        projection: {
          priority: 1,
          statusType: 1,
          assignedMembers: 1,
          departmentId: 1,
          branchId: 1,
          propertiesData: 1,
        },
      },
    ).toArray();
    const existingById = new Map(
      existingTickets.map((ticket) => [String(ticket._id), ticket]),
    );

    const ticketOps: AnyBulkWriteOperation<StringIdDocument>[] = [];
    const activityOps: AnyBulkWriteOperation<Document>[] = [];

    for (const doc of batch) {
      const fields = buildTicketFields(doc, propertyContext);
      const existing = existingById.get(String(doc._id));

      if (existing) {
        const set = buildRepair(existing, doc, fields);
        const keys = Object.keys(set);

        if (!keys.length) {
          unchangedCount++;
          continue;
        }

        for (const key of keys) {
          repairedFields[key] = (repairedFields[key] || 0) + 1;
        }

        ticketOps.push({
          updateOne: { filter: { _id: doc._id }, update: { $set: set } },
        });
        repairedCount++;
        continue;
      }

      const customerFieldData: Record<string, unknown> = {};
      if (doc.sourceConversationIds?.length)
        customerFieldData.sourceConversationIds = doc.sourceConversationIds;
      if (doc.customerIds?.length)
        customerFieldData.customerIds = doc.customerIds;

      ticketOps.push({
        insertOne: {
          document: {
            _id: doc._id,
            name: doc.name || 'Untitled',
            description: doc.description,
            channelId: STATIC_CHANNEL_ID,
            pipelineId:
              stageToPipeline.get(doc.stageId?.toString() || '') || '',
            statusId: doc.stageId,
            stageId: doc.stageId,
            type: normalizeTicketType(doc.type),
            priority: fields.priority,
            statusType: fields.statusType,
            assigneeId: fields.assigneeId,
            assignedMembers: fields.assignedMembers,
            departmentId: fields.departmentId,
            branchId: fields.branchId,
            createdBy: doc.userId,
            userId: doc.userId,
            attachments: doc.attachments || [],
            labelIds: doc.labelIds || [],
            tagIds: doc.tagIds || [],
            startDate: doc.startDate,
            targetDate: doc.closeDate,
            statusChangedDate:
              doc.stageChangedDate || doc.createdAt || new Date(),
            number: doc.number,
            subscribedUserIds: [
              ...new Set<string>([
                ...(doc.watchedUserIds || []),
                ...(doc.notifiedUserIds || []),
              ]),
            ],
            propertiesData: fields.propertiesData,
            companyIds: doc.companyIds || [],
            customerFieldData,
            state: doc.status === 'archived' ? 'archived' : 'active',
            createdAt: doc.createdAt || new Date(),
            updatedAt: doc.modifiedAt || doc.createdAt || new Date(),
          },
        },
      });

      activityOps.push({
        insertOne: {
          document: {
            action: 'CREATED',
            contentId: doc._id,
            module: 'NAME',
            metadata: {
              newValue: doc.name || 'Untitled',
              previousValue: undefined,
            },
            createdBy: doc.userId || 'migration',
            createdAt: doc.createdAt || new Date(),
            updatedAt: doc.createdAt || new Date(),
          },
        },
      });

      migratedCount++;
    }

    batch = [];

    await writeBulk(NEW_TICKETS, ticketOps, 'ticket write(s)');
    await writeBulk(NEW_ACTIVITIES, activityOps, 'activity(ies)');
  };

  for await (const doc of cursor) {
    if (!doc) continue;

    batch.push(doc);

    if (batch.length >= BATCH_SIZE) await flush();
  }

  await flush();

  console.log(
    `✅ Migrated : ${migratedCount}  |  Repaired : ${repairedCount}  |  Unchanged : ${unchangedCount}`,
  );

  if (repairedCount) {
    console.log(`   Repaired fields : ${JSON.stringify(repairedFields)}`);
  }

  if (propertyContext.unknownFieldIds.size) {
    console.log(
      `⚠️  ${
        propertyContext.unknownFieldIds.size
      } property field id(s) in tickets have no properties_fields/properties_groups document — run core migrateProperties first, or they were deleted. e.g. ${[
        ...propertyContext.unknownFieldIds,
      ]
        .slice(0, 5)
        .join(', ')}`,
    );
  }

  if (propertyContext.misplacedFieldIds.size) {
    console.log(
      `⚠️  ${
        propertyContext.misplacedFieldIds.size
      } property field(s) used by tickets are not contentType "${TICKET_CONTENT_TYPE}", so the ticket detail will not list them. e.g. ${[
        ...propertyContext.misplacedFieldIds,
      ]
        .slice(0, 5)
        .join(', ')}`,
    );
  }
}

async function migrateComments(): Promise<void> {
  console.log('\n🚀 Step 4 — ticket_comments → frontline_tickets_notes');

  const existingIds = await loadExistingIds(NEW_NOTES);
  console.log(`📋 Existing : ${existingIds.size}`);

  const cursor = OLD_COMMENTS.find({
    content: { $exists: true, $ne: '' },
  }).batchSize(BATCH_SIZE);

  let bulk: AnyBulkWriteOperation<StringIdDocument>[] = [];
  let migratedCount = 0;
  let skippedCount = 0;

  for await (const doc of cursor) {
    if (!doc) continue;

    if (existingIds.has(doc._id.toString())) {
      skippedCount++;
      continue;
    }

    if (!doc.content || !doc.typeId || !doc.userId) {
      console.log(
        `⏭️  Skipping comment ${doc._id} — missing content/typeId/userId`,
      );
      skippedCount++;
      continue;
    }

    const content = doc.parentId
      ? `*(Reply to comment ${doc.parentId})*\n\n${doc.content}`
      : doc.content;

    bulk.push({
      insertOne: {
        document: {
          _id: doc._id,
          content,
          contentId: doc.typeId,
          createdBy: doc.userId,
          mentions: [],
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.createdAt || new Date(),
        },
      },
    });

    migratedCount++;

    if (bulk.length >= BATCH_SIZE) {
      await writeBulk(NEW_NOTES, bulk, 'note(s)');
      bulk = [];
    }
  }

  await writeBulk(NEW_NOTES, bulk, 'note(s)');

  console.log(`✅ Migrated : ${migratedCount}  |  Skipped : ${skippedCount}`);
}

async function migrateChecklists(): Promise<void> {
  console.log(
    '\n🚀 Step 5 — tickets_checklists → frontline_tickets_notes (markdown)',
  );

  const existingIds = await loadExistingIds(NEW_NOTES);
  console.log(`📋 Existing : ${existingIds.size}`);

  const cursor = OLD_CHECKLISTS.find({ contentType: 'ticket' }).batchSize(
    BATCH_SIZE,
  );

  let bulk: AnyBulkWriteOperation<StringIdDocument>[] = [];
  let migratedCount = 0;
  let skippedCount = 0;

  for await (const checklist of cursor) {
    if (!checklist) continue;

    const noteId = `cl_${checklist._id.toString()}`;

    if (existingIds.has(noteId)) {
      skippedCount++;
      continue;
    }

    const items = await OLD_CHECKLIST_ITEMS.find({
      checklistId: checklist._id,
    })
      .sort({ order: 1 })
      .toArray();

    const lines = items
      .map((item) => `- [${item.isChecked ? 'x' : ' '}] ${item.content}`)
      .join('\n');

    const content =
      `**${checklist.title || 'Checklist'}**\n\n` +
      (lines || '*(empty checklist)*');

    bulk.push({
      insertOne: {
        document: {
          _id: noteId,
          content,
          contentId: checklist.contentTypeId,
          createdBy: checklist.createdUserId || 'migration',
          mentions: [],
          createdAt: checklist.createdDate || new Date(),
          updatedAt: checklist.createdDate || new Date(),
        },
      },
    });

    migratedCount++;

    if (bulk.length >= BATCH_SIZE) {
      await writeBulk(NEW_NOTES, bulk, 'checklist note(s)');
      bulk = [];
    }
  }

  await writeBulk(NEW_NOTES, bulk, 'checklist note(s)');

  console.log(`✅ Migrated : ${migratedCount}  |  Skipped : ${skippedCount}`);
}

const command = async () => {
  await client.connect();

  db = client.db() as Db;

  OLD_PIPELINES = db.collection<StringIdDocument>('tickets_pipelines');
  OLD_STAGES = db.collection<StringIdDocument>('tickets_stages');
  OLD_TICKETS = db.collection<StringIdDocument>('tickets');
  OLD_COMMENTS = db.collection<StringIdDocument>('ticket_comments');
  OLD_CHECKLISTS = db.collection<StringIdDocument>('tickets_checklists');
  OLD_CHECKLIST_ITEMS = db.collection<StringIdDocument>(
    'tickets_checklist_items',
  );

  NEW_PIPELINES = db.collection<StringIdDocument>(
    'frontline_tickets_pipelines',
  );
  NEW_STATUSES = db.collection<StringIdDocument>(
    'frontline_tickets_pipeline_statuses',
  );
  NEW_TICKETS = db.collection<StringIdDocument>('frontline_tickets');
  NEW_NOTES = db.collection<StringIdDocument>('frontline_tickets_notes');
  NEW_ACTIVITIES = db.collection('frontline_ticket_activities');
  PROPERTY_FIELDS = db.collection('properties_fields');
  PROPERTY_GROUPS = db.collection('properties_groups');

  console.log('═══════════════════════════════════════════════');
  console.log('  Frontline ticket migration');
  console.log(`  STATIC_CHANNEL_ID : ${STATIC_CHANNEL_ID}`);
  if (isDryRun) console.log('  ** DRY RUN — no data will be written **');
  console.log('═══════════════════════════════════════════════');

  await migratePipelines().catch((e) =>
    console.log(`❌ Step 1 error: ${e.message}`),
  );
  await migrateStatuses().catch((e) =>
    console.log(`❌ Step 2 error: ${e.message}`),
  );
  await migrateTickets().catch((e) =>
    console.log(`❌ Step 3 error: ${e.message}`),
  );
  await migrateComments().catch((e) =>
    console.log(`❌ Step 4 error: ${e.message}`),
  );
  await migrateChecklists().catch((e) =>
    console.log(`❌ Step 5 error: ${e.message}`),
  );

  console.log('\n═══════════════════════════════════════════════');
  if (isDryRun) {
    console.log(
      '  DRY RUN finished — nothing was written. Re-run with DRY_RUN=false.',
    );
  }
  console.log(`  Finished at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════');

  await client.close();
  process.exit();
};

command();
