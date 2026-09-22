import * as dotenv from 'dotenv';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  TARGET_SUBDOMAIN,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
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

let OLD_PIPELINES: Collection;
let OLD_STAGES: Collection;
let OLD_TASKS: Collection;
let OLD_COMMENTS: Collection;
let OLD_CHECKLISTS: Collection;
let OLD_CHECKLIST_ITEMS: Collection;

let NEW_TEAMS: Collection;
let NEW_TEAM_MEMBERS: Collection;
let NEW_STATUSES: Collection;
let NEW_TASKS: Collection;
let NEW_NOTES: Collection;
let NEW_ACTIVITIES: Collection;

const BATCH_SIZE = 1000;

const STATUS_TYPES = {
  STARTED: 1,
  UNSTARTED: 2,
  BACKLOG: 3,
  COMPLETED: 4,
  CANCELLED: 5,
} as const;

const STATUS_COLORS: Record<number, string> = {
  [STATUS_TYPES.BACKLOG]: '#6B7280',
  [STATUS_TYPES.UNSTARTED]: '#3B82F6',
  [STATUS_TYPES.STARTED]: '#F59E0B',
  [STATUS_TYPES.COMPLETED]: '#10B981',
  [STATUS_TYPES.CANCELLED]: '#EF4444',
};

const DEFAULT_STATUSES = [
  {
    name: 'backlog',
    type: STATUS_TYPES.BACKLOG,
    color: STATUS_COLORS[STATUS_TYPES.BACKLOG],
    order: 0,
  },
  {
    name: 'todo',
    type: STATUS_TYPES.UNSTARTED,
    color: STATUS_COLORS[STATUS_TYPES.UNSTARTED],
    order: 1,
  },
  {
    name: 'in progress',
    type: STATUS_TYPES.STARTED,
    color: STATUS_COLORS[STATUS_TYPES.STARTED],
    order: 2,
  },
  {
    name: 'done',
    type: STATUS_TYPES.COMPLETED,
    color: STATUS_COLORS[STATUS_TYPES.COMPLETED],
    order: 3,
  },
  {
    name: 'cancelled',
    type: STATUS_TYPES.CANCELLED,
    color: STATUS_COLORS[STATUS_TYPES.CANCELLED],
    order: 4,
  },
];

function probabilityToStatusType(probability?: string): number {
  switch (probability?.toLowerCase().trim()) {
    case 'won':
    case 'done':
      return STATUS_TYPES.COMPLETED;
    case 'lost':
      return STATUS_TYPES.CANCELLED;
    default: {
      const pct = parseInt((probability ?? '').replace('%', ''), 10);
      if (!isNaN(pct)) {
        if (pct >= 100) return STATUS_TYPES.COMPLETED;
        if (pct === 0) return STATUS_TYPES.BACKLOG;
        if (pct <= 30) return STATUS_TYPES.UNSTARTED;
        return STATUS_TYPES.STARTED;
      }
      return STATUS_TYPES.STARTED;
    }
  }
}

function positionToStatusType(pos: number, total: number): number {
  if (total === 1) return STATUS_TYPES.STARTED;
  if (pos === 0) return STATUS_TYPES.BACKLOG;
  if (pos === 1) return STATUS_TYPES.UNSTARTED;
  if (pos >= total - 1) return STATUS_TYPES.COMPLETED;
  if (pos >= total - 2) return STATUS_TYPES.CANCELLED;
  return STATUS_TYPES.STARTED;
}

function mapPriority(p?: string): number {
  switch (p?.toLowerCase().trim()) {
    case 'low':
      return 1;
    case 'medium':
      return 2;
    case 'high':
      return 3;
    case 'critical':
    case 'urgent':
      return 4;
    default:
      return 0;
  }
}

async function migrateTeams(): Promise<Map<string, ObjectId>> {
  console.log('\n🚀 Step 1 — pipelines (type=task) → operation_teams');

  const teamIdMap = new Map<string, ObjectId>();
  const cursor = OLD_PIPELINES.find({ type: 'task' }).batchSize(BATCH_SIZE);

  let bulk: any[] = [];
  let migrated = 0;

  for await (const doc of cursor) {
    if (!doc) continue;

    const newId = new ObjectId();
    teamIdMap.set(doc._id.toString(), newId);

    bulk.push({
      insertOne: {
        document: {
          _id: newId,
          name: doc.name || 'Untitled Team',
          description: doc.description || '',
          icon: 'IconBriefcase',
          memberIds: doc.memberIds || [],
          estimateType: 1,
          cycleEnabled: false,
          triageEnabled: false,
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.modifiedAt || doc.createdAt || new Date(),
        },
      },
    });

    migrated++;

    if (bulk.length >= BATCH_SIZE) {
      await NEW_TEAMS.bulkWrite(bulk, { ordered: false });
      console.log(`💾 Wrote batch of ${bulk.length} team(s)`);
      bulk = [];
    }
  }

  if (bulk.length) await NEW_TEAMS.bulkWrite(bulk, { ordered: false });

  console.log(`✅ Migrated : ${migrated}`);
  return teamIdMap;
}

async function migrateTeamMembers(
  teamIdMap: Map<string, ObjectId>,
): Promise<void> {
  console.log('\n🚀 Step 2 — pipeline.memberIds → operation_team_members');

  const pipelines = await OLD_PIPELINES.find({
    type: 'task',
    memberIds: { $exists: true, $ne: [] },
  }).toArray();

  let bulk: any[] = [];
  let migrated = 0;
  let skipped = 0;

  for (const pipeline of pipelines) {
    const teamId = teamIdMap.get(pipeline._id.toString());
    if (!teamId) {
      skipped++;
      continue;
    }

    const memberIds: string[] = pipeline.memberIds || [];

    for (const memberId of memberIds) {
      bulk.push({
        insertOne: {
          document: { teamId, memberId },
        },
      });

      migrated++;

      if (bulk.length >= BATCH_SIZE) {
        await NEW_TEAM_MEMBERS.bulkWrite(bulk, { ordered: false });
        console.log(`💾 Wrote batch of ${bulk.length} member(s)`);
        bulk = [];
      }
    }
  }

  if (bulk.length) await NEW_TEAM_MEMBERS.bulkWrite(bulk, { ordered: false });

  console.log(`✅ Migrated : ${migrated}  |  Skipped : ${skipped}`);
}

async function migrateStatuses(teamIdMap: Map<string, ObjectId>): Promise<{
  stageToStatusId: Map<string, ObjectId>;
  stageToStatusType: Map<string, number>;
}> {
  console.log('\n🚀 Step 3 — stages → operation_statuses');

  const stageToStatusId = new Map<string, ObjectId>();
  const stageToStatusType = new Map<string, number>();

  const taskPipelineIds = (
    await OLD_PIPELINES.find(
      { type: 'task' },
      { projection: { _id: 1 } },
    ).toArray()
  ).map((p) => p._id);

  const allStages = await OLD_STAGES.find({
    pipelineId: { $in: taskPipelineIds },
  })
    .sort({ pipelineId: 1, order: 1, createdAt: 1 })
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
  let migrated = 0;
  let skipped = 0;

  const teamsWithStatuses = new Set<string>();

  for (const [pipelineIdStr, stages] of byPipeline) {
    const teamId = teamIdMap.get(pipelineIdStr);
    if (!teamId) {
      console.log(
        `⏭️  No team mapping for pipeline ${pipelineIdStr} — skipping ${stages.length} stage(s)`,
      );
      skipped += stages.length;
      continue;
    }

    const total = stages.length;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageIdStr = stage._id.toString();

      const statusType = stage.probability
        ? probabilityToStatusType(stage.probability)
        : positionToStatusType(i, total);

      const newStatusId = new ObjectId();
      stageToStatusId.set(stageIdStr, newStatusId);
      stageToStatusType.set(stageIdStr, statusType);

      bulk.push({
        insertOne: {
          document: {
            _id: newStatusId,
            name: stage.name || 'Untitled Status',
            teamId,
            type: statusType,
            color: STATUS_COLORS[statusType] || '#4F46E5',
            order: stage.order ?? i,
            createdAt: stage.createdAt || new Date(),
            updatedAt: stage.modifiedAt || stage.createdAt || new Date(),
          },
        },
      });

      migrated++;
      teamsWithStatuses.add(teamId.toString());

      if (bulk.length >= BATCH_SIZE) {
        await NEW_STATUSES.bulkWrite(bulk, { ordered: false });
        console.log(`💾 Wrote batch of ${bulk.length} status(es)`);
        bulk = [];
      }
    }
  }

  if (bulk.length) await NEW_STATUSES.bulkWrite(bulk, { ordered: false });

  let defaultsCreated = 0;
  for (const [, teamId] of teamIdMap) {
    if (teamsWithStatuses.has(teamId.toString())) continue;

    const defaults = DEFAULT_STATUSES.map((s) => ({
      insertOne: {
        document: {
          ...s,
          _id: new ObjectId(),
          teamId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    }));

    await NEW_STATUSES.bulkWrite(defaults, { ordered: false });
    defaultsCreated++;
  }

  if (defaultsCreated) {
    console.log(
      `➕ Created default statuses for ${defaultsCreated} team(s) with no stages`,
    );
  }

  console.log(`✅ Migrated : ${migrated}  |  Skipped : ${skipped}`);
  return { stageToStatusId, stageToStatusType };
}

async function migrateTasks(
  teamIdMap: Map<string, ObjectId>,
  stageToStatusId: Map<string, ObjectId>,
  stageToStatusType: Map<string, number>,
): Promise<Map<string, ObjectId>> {
  console.log('\n🚀 Step 4 — tasks → operation_tasks + operation_activities');

  const taskIdMap = new Map<string, ObjectId>();

  const allStages = await OLD_STAGES.find(
    {},
    { projection: { _id: 1, pipelineId: 1 } },
  ).toArray();
  const stageToPipelineId = new Map<string, string>(
    allStages.map((s) => [s._id.toString(), s.pipelineId?.toString() ?? '']),
  );

  const taskPipelineSet = new Set(
    (
      await OLD_PIPELINES.find(
        { type: 'task' },
        { projection: { _id: 1 } },
      ).toArray()
    ).map((p) => p._id.toString()),
  );

  const teamNumberCounters = new Map<string, number>();

  const cursor = OLD_TASKS.find({}).batchSize(BATCH_SIZE);

  let bulk: any[] = [];
  let activityBulk: any[] = [];
  let migrated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    if (!doc) continue;

    const stageIdStr = doc.stageId?.toString() || '';
    const pipelineStr = stageToPipelineId.get(stageIdStr) ?? '';

    if (!pipelineStr || !taskPipelineSet.has(pipelineStr)) {
      skipped++;
      continue;
    }

    const teamId = teamIdMap.get(pipelineStr);
    if (!teamId) {
      skipped++;
      continue;
    }

    const statusId = stageToStatusId.get(stageIdStr);
    if (!statusId) {
      console.log(
        `⏭️  No status mapping for stageId ${stageIdStr} — skipping task "${doc.name}" (${doc._id})`,
      );
      skipped++;
      continue;
    }

    const statusType =
      stageToStatusType.get(stageIdStr) ?? STATUS_TYPES.UNSTARTED;

    const teamKey = teamId.toString();
    const nextNumber = (teamNumberCounters.get(teamKey) ?? 0) + 1;
    teamNumberCounters.set(teamKey, nextNumber);

    const newTaskId = new ObjectId();
    taskIdMap.set(doc._id.toString(), newTaskId);

    bulk.push({
      insertOne: {
        document: {
          _id: newTaskId,
          name: doc.name || 'Untitled',
          description: doc.description,
          status: statusId,
          statusType,
          teamId,
          priority: mapPriority(doc.priority),
          labelIds: doc.labelIds || [],
          tagIds: doc.tagIds || [],
          assigneeId: doc.assignedUserIds?.[0] ?? undefined,
          createdBy: doc.userId,
          startDate: doc.startDate,
          targetDate: doc.closeDate,
          statusChangedDate:
            doc.stageChangedDate || doc.createdAt || new Date(),
          estimatePoint: 0,
          number: nextNumber,
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.modifiedAt || doc.createdAt || new Date(),
        },
      },
    });

    activityBulk.push({
      insertOne: {
        document: {
          action: 'CREATED',
          contentId: newTaskId,
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

    migrated++;

    if (bulk.length >= BATCH_SIZE) {
      await NEW_TASKS.bulkWrite(bulk, { ordered: false });
      await NEW_ACTIVITIES.bulkWrite(activityBulk, { ordered: false });
      console.log(`💾 Wrote batch of ${bulk.length} task(s)`);
      bulk = [];
      activityBulk = [];
    }
  }

  if (bulk.length) {
    await NEW_TASKS.bulkWrite(bulk, { ordered: false });
    await NEW_ACTIVITIES.bulkWrite(activityBulk, { ordered: false });
  }

  console.log(`✅ Migrated : ${migrated}  |  Skipped : ${skipped}`);
  return taskIdMap;
}

async function migrateComments(
  taskIdMap: Map<string, ObjectId>,
): Promise<void> {
  console.log('\n🚀 Step 5 — task_comments → operation_notes');

  const cursor = OLD_COMMENTS.find({
    content: { $exists: true, $ne: '' },
  }).batchSize(BATCH_SIZE);

  let bulk: any[] = [];
  let migrated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    if (!doc) continue;

    if (!doc.content || !doc.typeId || !doc.userId) {
      console.log(
        `⏭️  Skipping comment ${doc._id} — missing content/typeId/userId`,
      );
      skipped++;
      continue;
    }

    const contentId = taskIdMap.get(doc.typeId.toString());
    if (!contentId) {
      skipped++;
      continue;
    }

    const content = doc.parentId
      ? `*(Reply to comment ${doc.parentId})*\n\n${doc.content}`
      : doc.content;

    bulk.push({
      insertOne: {
        document: {
          _id: new ObjectId(),
          content,
          contentId,
          createdBy: doc.userId,
          mentions: [],
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.createdAt || new Date(),
        },
      },
    });

    migrated++;

    if (bulk.length >= BATCH_SIZE) {
      await NEW_NOTES.bulkWrite(bulk, { ordered: false });
      console.log(`💾 Wrote batch of ${bulk.length} note(s)`);
      bulk = [];
    }
  }

  if (bulk.length) await NEW_NOTES.bulkWrite(bulk, { ordered: false });

  console.log(`✅ Migrated : ${migrated}  |  Skipped : ${skipped}`);
}

async function migrateChecklists(
  taskIdMap: Map<string, ObjectId>,
): Promise<void> {
  console.log('\n🚀 Step 6 — tasks_checklists → operation_notes (markdown)');

  const cursor = OLD_CHECKLISTS.find({ contentType: 'task' }).batchSize(
    BATCH_SIZE,
  );

  let bulk: any[] = [];
  let migrated = 0;
  let skipped = 0;

  for await (const checklist of cursor) {
    if (!checklist) continue;

    const contentId = taskIdMap.get(checklist.contentTypeId?.toString() ?? '');
    if (!contentId) {
      skipped++;
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
          _id: new ObjectId(),
          content,
          contentId,
          createdBy: checklist.createdUserId || 'migration',
          mentions: [],
          createdAt: checklist.createdDate || new Date(),
          updatedAt: checklist.createdDate || new Date(),
        },
      },
    });

    migrated++;

    if (bulk.length >= BATCH_SIZE) {
      await NEW_NOTES.bulkWrite(bulk, { ordered: false });
      console.log(`💾 Wrote batch of ${bulk.length} checklist note(s)`);
      bulk = [];
    }
  }

  if (bulk.length) await NEW_NOTES.bulkWrite(bulk, { ordered: false });

  console.log(`✅ Migrated : ${migrated}  |  Skipped : ${skipped}`);
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

  OLD_PIPELINES = db.collection('tasks_pipelines');
  OLD_STAGES = db.collection('tasks_stages');
  OLD_TASKS = db.collection('tasks');
  OLD_COMMENTS = db.collection('task_comments');
  OLD_CHECKLISTS = db.collection('tasks_checklists');
  OLD_CHECKLIST_ITEMS = db.collection('tasks_checklist_items');

  NEW_TEAMS = db.collection('operation_teams');
  NEW_TEAM_MEMBERS = db.collection('operation_team_members');
  NEW_STATUSES = db.collection('operation_statuses');
  NEW_TASKS = db.collection('operation_tasks');
  NEW_NOTES = db.collection('operation_notes');
  NEW_ACTIVITIES = db.collection('operation_activities');

  console.log('═══════════════════════════════════════════════');
  console.log('  Operation task migration');
  console.log(`  MONGO_URL : ${MONGO_URL}`);
  console.log('═══════════════════════════════════════════════');

  console.log('\n🗑️  Dropping existing destination collections...');
  const newCollections = [
    'operation_teams',
    'operation_team_members',
    'operation_statuses',
    'operation_tasks',
    'operation_notes',
    'operation_activities',
  ];
  for (const name of newCollections) {
    const exists = await db.listCollections({ name }).hasNext();
    if (exists) {
      await db.collection(name).drop();
      console.log(`   Dropped: ${name}`);
    }
  }
  console.log('✅ Drop complete\n');

  const teamIdMap = await migrateTeams().catch((e) => {
    console.log(`❌ Step 1 error: ${e.message}`);
    return new Map<string, ObjectId>();
  });

  await migrateTeamMembers(teamIdMap).catch((e) =>
    console.log(`❌ Step 2 error: ${e.message}`),
  );

  const { stageToStatusId, stageToStatusType } = await migrateStatuses(
    teamIdMap,
  ).catch((e) => {
    console.log(`❌ Step 3 error: ${e.message}`);
    return {
      stageToStatusId: new Map<string, ObjectId>(),
      stageToStatusType: new Map<string, number>(),
    };
  });

  const taskIdMap = await migrateTasks(
    teamIdMap,
    stageToStatusId,
    stageToStatusType,
  ).catch((e) => {
    console.log(`❌ Step 4 error: ${e.message}`);
    return new Map<string, ObjectId>();
  });

  await migrateComments(taskIdMap).catch((e) =>
    console.log(`❌ Step 5 error: ${e.message}`),
  );

  await migrateChecklists(taskIdMap).catch((e) =>
    console.log(`❌ Step 6 error: ${e.message}`),
  );

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Finished at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════');

  process.exit();
};

command();
