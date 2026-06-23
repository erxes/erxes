import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  TARGET_SUBDOMAIN,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const STATIC_CHANNEL_ID =
  process.env.STATIC_CHANNEL_ID;

if (!TARGET_SUBDOMAIN && !STATIC_CHANNEL_ID) {
  throw new Error('Environment variable TARGET_SUBDOMAIN or STATIC_CHANNEL_ID must be set.');
}

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);
let db: Db;

let OLD_PIPELINES: Collection;
let OLD_STAGES: Collection;
let OLD_TICKETS: Collection;
let OLD_COMMENTS: Collection;
let OLD_CHECKLISTS: Collection;
let OLD_CHECKLIST_ITEMS: Collection;

let NEW_PIPELINES: Collection;
let NEW_STATUSES: Collection;
let NEW_TICKETS: Collection;
let NEW_NOTES: Collection;
let NEW_ACTIVITIES: Collection;

const BATCH_SIZE = 1000;

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

/** Map old probability string → new status type number (1–6) */
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

function mapPriority(p?: string): number {
  switch (p?.toLowerCase().trim()) {
    case 'low':
    case 'minor':
      return 1;
    case 'medium':
      return 2;
    case 'high':
      return 3;
    case 'critical':
      return 4;
    default:
      return 0;
  }
}

function normalizeTicketType(t?: string): string {
  const lower = (t ?? '').toLowerCase();
  return VALID_TICKET_TYPES.has(lower) ? lower : 'ticket';
}

/** Load a Set of existing _ids for idempotent re-runs */
async function loadExistingIds(col: Collection): Promise<Set<string>> {
  const docs = await col.find({}, { projection: { _id: 1 } }).toArray();
  return new Set(docs.map((d) => d._id.toString()));
}

async function migratePipelines(): Promise<void> {
  console.log('\n🚀 Step 1 — tickets_pipelines → frontline_tickets_pipelines');
  console.log(`   Channel  : ${STATIC_CHANNEL_ID}`);

  const existingIds = await loadExistingIds(NEW_PIPELINES);
  console.log(`📋 Existing : ${existingIds.size}`);

  const cursor = OLD_PIPELINES.find({ type: 'ticket' }).batchSize(BATCH_SIZE);

  let bulk: any[] = [];
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
      await NEW_PIPELINES.bulkWrite(bulk, { ordered: false });
      console.log(`💾 Wrote batch of ${bulk.length} pipeline(s)`);
      bulk = [];
    }
  }

  if (bulk.length) await NEW_PIPELINES.bulkWrite(bulk, { ordered: false });

  console.log(`✅ Migrated : ${migratedCount}  |  Skipped : ${skippedCount}`);
}

async function migrateStatuses(): Promise<void> {
  console.log(
    '\n🚀 Step 2 — tickets_stages → frontline_tickets_pipeline_statuses',
  );

  const existingIds = await loadExistingIds(NEW_STATUSES);
  console.log(`📋 Existing : ${existingIds.size}`);

  const allStages = await OLD_STAGES.find({ type: 'ticket' })
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  console.log(`📋 Source   : ${allStages.length} stage(s)`);

  const byPipeline = new Map<string, any[]>();
  for (const stage of allStages) {
    const pid = stage.pipelineId?.toString() || '';
    const group = byPipeline.get(pid) ?? [];
    group.push(stage);
    byPipeline.set(pid, group);
  }

  let bulk: any[] = [];
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
        await NEW_STATUSES.bulkWrite(bulk, { ordered: false });
        console.log(`💾 Wrote batch of ${bulk.length} status(es)`);
        bulk = [];
      }
    }
  }

  if (bulk.length) await NEW_STATUSES.bulkWrite(bulk, { ordered: false });

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

  const existingIds = await loadExistingIds(NEW_TICKETS);
  console.log(`📋 Existing : ${existingIds.size}`);

  const cursor = OLD_TICKETS.find({ type: { $ne: 'deal' } }).batchSize(
    BATCH_SIZE,
  );

  let bulk: any[] = [];
  let activityBulk: any[] = [];
  let migratedCount = 0;
  let skippedCount = 0;

  for await (const doc of cursor) {
    if (!doc) continue;

    if (existingIds.has(doc._id.toString())) {
      skippedCount++;
      continue;
    }

    const pipelineId = stageToPipeline.get(doc.stageId?.toString() || '') || '';

    const subscribedUserIds = [
      ...new Set<string>([
        ...(doc.watchedUserIds || []),
        ...(doc.notifiedUserIds || []),
      ]),
    ];

    let propertiesData: Record<string, unknown> | undefined;
    if (Array.isArray(doc.customFieldsData) && doc.customFieldsData.length) {
      propertiesData = {};
      for (const cf of doc.customFieldsData) {
        if (cf.field) propertiesData[cf.field] = cf.value ?? cf.stringValue;
      }
    }

    const customerFieldData: Record<string, unknown> = {};
    if (doc.sourceConversationIds?.length)
      customerFieldData.sourceConversationIds = doc.sourceConversationIds;
    if (doc.customerIds?.length)
      customerFieldData.customerIds = doc.customerIds;

    bulk.push({
      insertOne: {
        document: {
          _id: doc._id,
          name: doc.name || 'Untitled',
          description: doc.description,
          channelId: STATIC_CHANNEL_ID,
          pipelineId,
          statusId: doc.stageId,
          stageId: doc.stageId,
          type: normalizeTicketType(doc.type),
          priority: mapPriority(doc.priority),
          assigneeId: doc.assignedUserIds?.[0] ?? undefined,
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
          statusType: 0,
          subscribedUserIds,
          propertiesData,
          companyIds: doc.companyIds || [],
          customerFieldData,
          state: doc.status === 'archived' ? 'archived' : 'active',
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.modifiedAt || doc.createdAt || new Date(),
        },
      },
    });

    activityBulk.push({
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

    if (bulk.length >= BATCH_SIZE) {
      await NEW_TICKETS.bulkWrite(bulk, { ordered: false });
      await NEW_ACTIVITIES.bulkWrite(activityBulk, { ordered: false });
      console.log(`💾 Wrote batch of ${bulk.length} ticket(s)`);
      bulk = [];
      activityBulk = [];
    }
  }

  if (bulk.length) {
    await NEW_TICKETS.bulkWrite(bulk, { ordered: false });
    await NEW_ACTIVITIES.bulkWrite(activityBulk, { ordered: false });
  }

  console.log(`✅ Migrated : ${migratedCount}  |  Skipped : ${skippedCount}`);
}

async function migrateComments(): Promise<void> {
  console.log('\n🚀 Step 4 — ticket_comments → frontline_tickets_notes');

  const existingIds = await loadExistingIds(NEW_NOTES);
  console.log(`📋 Existing : ${existingIds.size}`);

  const cursor = OLD_COMMENTS.find({
    content: { $exists: true, $ne: '' },
  }).batchSize(BATCH_SIZE);

  let bulk: any[] = [];
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
      await NEW_NOTES.bulkWrite(bulk, { ordered: false });
      console.log(`💾 Wrote batch of ${bulk.length} note(s)`);
      bulk = [];
    }
  }

  if (bulk.length) await NEW_NOTES.bulkWrite(bulk, { ordered: false });

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

  let bulk: any[] = [];
  let migratedCount = 0;
  let skippedCount = 0;

  for await (const checklist of cursor) {
    if (!checklist) continue;

    const noteId = `cl_${checklist._id.toString()}`;

    if (existingIds.has(noteId)) {
      skippedCount++;
      continue;
    }

    const items = await OLD_CHECKLIST_ITEMS.find({ checklistId: checklist._id })
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
      await NEW_NOTES.bulkWrite(bulk, { ordered: false });
      console.log(`💾 Wrote batch of ${bulk.length} checklist note(s)`);
      bulk = [];
    }
  }

  if (bulk.length) await NEW_NOTES.bulkWrite(bulk, { ordered: false });

  console.log(`✅ Migrated : ${migratedCount}  |  Skipped : ${skippedCount}`);
}

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

  OLD_PIPELINES = db.collection('tickets_pipelines');
  OLD_STAGES = db.collection('tickets_stages');
  OLD_TICKETS = db.collection('tickets');
  OLD_COMMENTS = db.collection('ticket_comments');
  OLD_CHECKLISTS = db.collection('tickets_checklists');
  OLD_CHECKLIST_ITEMS = db.collection('tickets_checklist_items');

  NEW_PIPELINES = db.collection('frontline_tickets_pipelines');
  NEW_STATUSES = db.collection('frontline_tickets_pipeline_statuses');
  NEW_TICKETS = db.collection('frontline_tickets');
  NEW_NOTES = db.collection('frontline_tickets_notes');
  NEW_ACTIVITIES = db.collection('frontline_ticket_activities');

  console.log('═══════════════════════════════════════════════');
  console.log('  Frontline ticket migration');
  console.log(`  STATIC_CHANNEL_ID : ${STATIC_CHANNEL_ID}`);
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
  console.log(`  Finished at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════');

  process.exit();
};

command();
