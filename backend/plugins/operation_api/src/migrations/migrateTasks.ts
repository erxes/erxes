import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient, ObjectId } from 'mongodb';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);
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
let NEW_CYCLES: Collection;


async function fixTaskIds(): Promise<void> {
  console.log('\n🔧 Step 0c — fix string task _ids → ObjectId');

  const tasks = await NEW_TASKS
    .find({ _id: { $type: 'string' } })
    .toArray();

  if (!tasks.length) {
    console.log('   Nothing to fix — no tasks with string _id.');
    return;
  }

  console.log(`   Found ${tasks.length} task(s) with string _id`);

  const idMap = new Map<string, ObjectId>();
  for (const task of tasks) {
    idMap.set(String(task._id), new ObjectId());
  }

  const oldIds = Array.from(idMap.keys());

  // 1. Batch insert new documents with ObjectId _id
  console.log('   Inserting new documents...');
  const insertOps = tasks.map((task) => ({
    insertOne: {
      document: { ...task, _id: idMap.get(String(task._id)) } as any,
    },
  }));
  for (let i = 0; i < insertOps.length; i += BATCH_SIZE) {
    await NEW_TASKS.bulkWrite(insertOps.slice(i, i + BATCH_SIZE), { ordered: false });
    console.log(`   💾 Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(insertOps.length / BATCH_SIZE)}`);
  }

  // 2. Re-point activities.contentId
  console.log('   Re-pointing activities...');
  for (let i = 0; i < oldIds.length; i += BATCH_SIZE) {
    const chunk = oldIds.slice(i, i + BATCH_SIZE);
    const acts = await NEW_ACTIVITIES.find({ contentId: { $in: chunk as any[] } }).toArray();
    if (acts.length) {
      const bulk = acts.map((a) => ({
        updateOne: {
          filter: { _id: a._id },
          update: { $set: { contentId: idMap.get(String(a.contentId)) } },
        },
      }));
      await NEW_ACTIVITIES.bulkWrite(bulk, { ordered: false });
    }
  }

  // 3. Re-point notes.contentId
  console.log('   Re-pointing notes...');
  for (let i = 0; i < oldIds.length; i += BATCH_SIZE) {
    const chunk = oldIds.slice(i, i + BATCH_SIZE);
    const notes = await NEW_NOTES.find({ contentId: { $in: chunk as any[] } }).toArray();
    if (notes.length) {
      const bulk = notes.map((n) => ({
        updateOne: {
          filter: { _id: n._id },
          update: { $set: { contentId: idMap.get(String(n.contentId)) } },
        },
      }));
      await NEW_NOTES.bulkWrite(bulk, { ordered: false });
    }
  }

  // 4. Delete old string-_id documents
  console.log('   Deleting old documents...');
  for (let i = 0; i < oldIds.length; i += BATCH_SIZE) {
    await NEW_TASKS.deleteMany({ _id: { $in: oldIds.slice(i, i + BATCH_SIZE) as any[] } });
  }

  console.log(`✅ Step 0c done — ${tasks.length} task(s) re-indexed`);
}


async function fixLegacyStatusIds(): Promise<void> {
  console.log('\n🔧 Step 0b — fix legacy string status IDs → ObjectId in operation_tasks');

  const tasks = await NEW_TASKS
    .find({ status: { $type: 'string' } })
    .toArray();

  if (!tasks.length) {
    console.log('   Nothing to fix — no tasks with string status.');
    return;
  }

  console.log(`   Found ${tasks.length} task(s) with string status`);

  const allStatuses = await NEW_STATUSES
    .find({}, { projection: { _id: 1, teamId: 1, type: 1, order: 1 } })
    .sort({ order: 1 })
    .toArray();

  const statusByTeamAndType = new Map<string, ObjectId>();
  for (const s of allStatuses) {
    const key = `${s.teamId}::${s.type}`;
    if (!statusByTeamAndType.has(key)) {
      statusByTeamAndType.set(key, s._id as ObjectId);
    }
  }

  const statusByTeam = new Map<string, ObjectId>();
  for (const s of allStatuses) {
    const key = s.teamId?.toString();
    if (key && !statusByTeam.has(key)) {
      statusByTeam.set(key, s._id as ObjectId);
    }
  }

  const bulk: any[] = [];
  let fixed = 0;
  let failed = 0;

  for (const task of tasks) {
    const teamIdStr = task.teamId?.toString();
    if (!teamIdStr) { failed++; continue; }

    const statusType = task.statusType ?? STATUS_TYPES.UNSTARTED;
    const newStatusId =
      statusByTeamAndType.get(`${teamIdStr}::${statusType}`) ||
      statusByTeam.get(teamIdStr);

    if (!newStatusId) {
      console.log(`   ⚠️  No status for task "${task.name}" (${task._id}) — team ${teamIdStr}`);
      failed++;
      continue;
    }

    bulk.push({
      updateOne: {
        filter: { _id: task._id },
        update: { $set: { status: newStatusId } },
      },
    });
    fixed++;
  }

  if (bulk.length) {
    await NEW_TASKS.bulkWrite(bulk, { ordered: false });
  }

  console.log(`✅ Step 0b done — ${fixed} fixed, ${failed} failed`);
}


async function fixLegacyTeamIds(): Promise<void> {
  console.log('\n🔧 Step 0 — fix legacy string teamIds → ObjectId');

  const newTeams = await NEW_TEAMS
    .find({ legacyId: { $exists: true } }, { projection: { _id: 1, legacyId: 1 } })
    .toArray();

  if (!newTeams.length) {
    console.log('   Nothing to fix — no teams with legacyId found.');
    return;
  }

  console.log(`   Found ${newTeams.length} team(s) with legacyId`);

  const relatedCollections: Array<{ col: Collection; field: string }> = [
    { col: NEW_TEAM_MEMBERS, field: 'teamId' },
    { col: NEW_STATUSES,     field: 'teamId' },
    { col: NEW_TASKS,        field: 'teamId' },
    { col: NEW_CYCLES,       field: 'teamId' },
  ];

  let fixedDocs  = 0;
  const oldIds: string[] = [];

  for (const team of newTeams) {
    const legacyId = String(team.legacyId);
    const newId    = team._id as ObjectId;

    oldIds.push(legacyId);

    for (const { col, field } of relatedCollections) {
      const result = await col.updateMany(
        { [field]: legacyId },
        { $set: { [field]: newId } },
      );
      if (result.modifiedCount > 0) {
        console.log(`   ✅ ${col.collectionName}.${field}: ${result.modifiedCount} updated  (${legacyId} → ObjectId)`);
        fixedDocs += result.modifiedCount;
      }
    }
  }


  if (oldIds.length) {
    const deleted = await NEW_TEAMS.deleteMany({ _id: { $in: oldIds as any[] } });
    console.log(`   🗑️  Removed ${deleted.deletedCount} stale nanoid-id team document(s)`);
  }

  console.log(`✅ Step 0 done — ${fixedDocs} related doc(s) re-pointed, ${oldIds.length} old team(s) removed`);
}

const BATCH_SIZE = 1000;

const STATUS_TYPES = {
  STARTED:   1,
  UNSTARTED: 2,
  BACKLOG:   3,
  COMPLETED: 4,
  CANCELLED: 5,
} as const;

const STATUS_COLORS: Record<number, string> = {
  [STATUS_TYPES.BACKLOG]:   '#6B7280',
  [STATUS_TYPES.UNSTARTED]: '#3B82F6',
  [STATUS_TYPES.STARTED]:   '#F59E0B',
  [STATUS_TYPES.COMPLETED]: '#10B981',
  [STATUS_TYPES.CANCELLED]: '#EF4444',
};

const DEFAULT_STATUSES = [
  { name: 'backlog',      type: STATUS_TYPES.BACKLOG,   color: STATUS_COLORS[STATUS_TYPES.BACKLOG],   order: 0 },
  { name: 'todo',         type: STATUS_TYPES.UNSTARTED, color: STATUS_COLORS[STATUS_TYPES.UNSTARTED], order: 1 },
  { name: 'in progress',  type: STATUS_TYPES.STARTED,   color: STATUS_COLORS[STATUS_TYPES.STARTED],   order: 2 },
  { name: 'done',         type: STATUS_TYPES.COMPLETED, color: STATUS_COLORS[STATUS_TYPES.COMPLETED], order: 3 },
  { name: 'cancelled',    type: STATUS_TYPES.CANCELLED, color: STATUS_COLORS[STATUS_TYPES.CANCELLED], order: 4 },
];


function probabilityToStatusType(probability?: string): number {
  switch (probability?.toLowerCase().trim()) {
    case 'won':
    case 'done':     return STATUS_TYPES.COMPLETED;
    case 'lost':     return STATUS_TYPES.CANCELLED;
    default: {
      const pct = parseInt((probability ?? '').replace('%', ''), 10);
      if (!isNaN(pct)) {
        if (pct >= 100) return STATUS_TYPES.COMPLETED;
        if (pct === 0)  return STATUS_TYPES.BACKLOG;
        if (pct <= 30)  return STATUS_TYPES.UNSTARTED;
        return STATUS_TYPES.STARTED;
      }
      return STATUS_TYPES.STARTED;
    }
  }
}

function positionToStatusType(pos: number, total: number): number {
  if (total === 1)       return STATUS_TYPES.STARTED;
  if (pos === 0)         return STATUS_TYPES.BACKLOG;
  if (pos === 1)         return STATUS_TYPES.UNSTARTED;
  if (pos >= total - 1)  return STATUS_TYPES.COMPLETED;
  if (pos >= total - 2)  return STATUS_TYPES.CANCELLED;
  return STATUS_TYPES.STARTED;
}

function mapPriority(p?: string): number {
  switch (p?.toLowerCase().trim()) {
    case 'low':               return 1;
    case 'medium':            return 2;
    case 'high':              return 3;
    case 'critical':
    case 'urgent':            return 4;
    default:                  return 0;
  }
}

async function loadExistingIds(col: Collection): Promise<Set<string>> {
  const docs = await col.find({}, { projection: { _id: 1 } }).toArray();
  return new Set(docs.map((d) => d._id.toString()));
}

async function migrateTeams(): Promise<Map<string, ObjectId>> {
  console.log('\n🚀 Step 1 — pipelines (type=task) → operation_teams');

  const existingTeams = await NEW_TEAMS
    .find({}, { projection: { _id: 1, legacyId: 1 } })
    .toArray();

  const oldToNewTeam = new Map<string, ObjectId>();
  for (const t of existingTeams) {
    if (t.legacyId) {
      oldToNewTeam.set(String(t.legacyId), t._id as ObjectId);
    }
  }
  console.log(`📋 Existing : ${oldToNewTeam.size}`);

  const cursor = OLD_PIPELINES.find({ type: 'task' }).batchSize(BATCH_SIZE);

  let bulk: any[] = [];
  let migrated = 0;
  let skipped  = 0;

  for await (const doc of cursor) {
    if (!doc) continue;

    const legacyId = doc._id.toString();

    if (oldToNewTeam.has(legacyId)) { skipped++; continue; }

    const newTeamId = new ObjectId();
    oldToNewTeam.set(legacyId, newTeamId);

    bulk.push({
      insertOne: {
        document: {
          _id:          newTeamId,
          legacyId,
          name:         doc.name        || 'Untitled Team',
          description:  doc.description || '',
          icon:         'IconBriefcase',
          memberIds:    doc.memberIds   || [],
          estimateType: 0,
          cycleEnabled:  false,
          triageEnabled: false,
          createdAt:    doc.createdAt   || new Date(),
          updatedAt:    doc.modifiedAt  || doc.createdAt || new Date(),
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

  console.log(`✅ Migrated : ${migrated}  |  Skipped : ${skipped}`);
  return oldToNewTeam;
}


async function migrateTeamMembers(oldToNewTeam: Map<string, ObjectId>): Promise<void> {
  console.log('\n🚀 Step 2 — pipeline.memberIds → operation_team_members');

  const existingDocs = await NEW_TEAM_MEMBERS
    .find({}, { projection: { teamId: 1, memberId: 1 } })
    .toArray();

  const existingKeys = new Set(
    existingDocs.map((d) => `${d.teamId}::${d.memberId}`),
  );
  console.log(`📋 Existing : ${existingKeys.size}`);

  const pipelines = await OLD_PIPELINES
    .find({ type: 'task', memberIds: { $exists: true, $ne: [] } })
    .toArray();

  let bulk: any[] = [];
  let migrated = 0;
  let skipped  = 0;

  for (const pipeline of pipelines) {
    const memberIds: string[] = pipeline.memberIds || [];
    const newTeamId = oldToNewTeam.get(pipeline._id.toString());

    if (!newTeamId) { skipped += memberIds.length; continue; }

    for (const memberId of memberIds) {
      const key = `${newTeamId}::${memberId}`;

      if (existingKeys.has(key)) { skipped++; continue; }

      bulk.push({
        insertOne: {
          document: {
            teamId: newTeamId,
            memberId,
          },
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


async function migrateStatuses(oldToNewTeam: Map<string, ObjectId>): Promise<Map<string, ObjectId>> {
  console.log('\n🚀 Step 3 — stages → operation_statuses');

  const existingIds = await loadExistingIds(NEW_STATUSES);
  console.log(`📋 Existing : ${existingIds.size}`);

  const taskPipelineIds = (
    await OLD_PIPELINES.find({ type: 'task' }, { projection: { _id: 1 } }).toArray()
  ).map((p) => p._id);

  const allStages = await OLD_STAGES
    .find({ pipelineId: { $in: taskPipelineIds } })
    .sort({ pipelineId: 1, order: 1, createdAt: 1 })
    .toArray();

  console.log(`📋 Source   : ${allStages.length} stage(s)`);

  const stageToStatusId = new Map<string, ObjectId>();

  const byPipeline = new Map<string, any[]>();
  for (const stage of allStages) {
    const pid   = stage.pipelineId?.toString() || '';
    const group = byPipeline.get(pid) ?? [];
    group.push(stage);
    byPipeline.set(pid, group);
  }

  let bulk: any[] = [];
  let migrated = 0;
  let skipped  = 0;

  const existingStatuses = await NEW_STATUSES
    .find({}, { projection: { _id: 1 } })
    .toArray();
  for (const s of existingStatuses) {
    stageToStatusId.set(s._id.toString(), s._id as ObjectId);
  }

  for (const [pipelineIdStr, stages] of byPipeline) {
    const newTeamId = oldToNewTeam.get(pipelineIdStr);
    if (!newTeamId) { skipped += stages.length; continue; }

    const total = stages.length;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageIdStr = stage._id.toString();

      if (existingIds.has(stageIdStr)) {
        stageToStatusId.set(stageIdStr, stage._id as ObjectId);
        skipped++;
        continue;
      }

      if (!stage.pipelineId) {
        console.log(`⏭️  No pipelineId — skipping stage "${stage.name}" (${stage._id})`);
        skipped++;
        continue;
      }

      const statusType = stage.probability
        ? probabilityToStatusType(stage.probability)
        : positionToStatusType(i, total);

      const newStatusId = new ObjectId();
      stageToStatusId.set(stageIdStr, newStatusId);

      bulk.push({
        insertOne: {
          document: {
            _id:      newStatusId,
            name:     stage.name  || 'Untitled Status',
            teamId:   newTeamId,
            type:     statusType,
            color:    STATUS_COLORS[statusType] || '#4F46E5',
            order:    stage.order ?? i,
            createdAt: stage.createdAt  || new Date(),
            updatedAt: stage.modifiedAt || stage.createdAt || new Date(),
          },
        },
      });

      migrated++;

      if (bulk.length >= BATCH_SIZE) {
        await NEW_STATUSES.bulkWrite(bulk, { ordered: false });
        console.log(`💾 Wrote batch of ${bulk.length} status(es)`);
        bulk = [];
      }
    }
  }

  if (bulk.length) await NEW_STATUSES.bulkWrite(bulk, { ordered: false });

  const teamsWithStatuses = new Set(
    (await NEW_STATUSES.distinct('teamId')).map((id) => id.toString()),
  );

  const allTeams = await NEW_TEAMS.find({}, { projection: { _id: 1 } }).toArray();
  let defaultsCreated = 0;

  for (const team of allTeams) {
    if (teamsWithStatuses.has(team._id.toString())) continue;

    const defaults = DEFAULT_STATUSES.map((s) => ({
      insertOne: {
        document: {
          ...s,
          _id:       new ObjectId(),
          teamId:    team._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    }));

    await NEW_STATUSES.bulkWrite(defaults, { ordered: false });
    defaultsCreated++;
  }

  if (defaultsCreated) {
    console.log(`➕ Created default statuses for ${defaultsCreated} team(s) with no stages`);
  }

  console.log(`✅ Migrated : ${migrated}  |  Skipped : ${skipped}`);
  return stageToStatusId;
}


async function migrateTasks(
  stageToStatusId: Map<string, ObjectId>,
  oldToNewTeam: Map<string, ObjectId>,
): Promise<void> {
  console.log('\n🚀 Step 4 — tasks → operation_tasks + operation_activities');

  const allStages = await OLD_STAGES
    .find({}, { projection: { _id: 1, pipelineId: 1 } })
    .toArray();
  const stageToPipelineStr = new Map<string, string>(
    allStages.map((s) => [s._id.toString(), s.pipelineId?.toString() || '']),
  );

  const taskPipelines = await OLD_PIPELINES
    .find({ type: 'task' }, { projection: { _id: 1 } })
    .toArray();
  const taskPipelineSet = new Set(taskPipelines.map((p) => p._id.toString()));

  const teamNumberCounters = new Map<string, number>();
  const existingCounts = await NEW_TASKS
    .aggregate([
      { $group: { _id: '$teamId', maxNumber: { $max: '$number' } } },
    ])
    .toArray();
  for (const row of existingCounts) {
    teamNumberCounters.set(row._id?.toString(), row.maxNumber || 0);
  }

  const existingIds = await loadExistingIds(NEW_TASKS);
  console.log(`📋 Existing : ${existingIds.size}`);

  const cursor = OLD_TASKS.find({}).batchSize(BATCH_SIZE);

  let bulk: any[]         = [];
  let activityBulk: any[] = [];
  let migrated = 0;
  let skipped  = 0;

  for await (const doc of cursor) {
    if (!doc) continue;
    if (existingIds.has(doc._id.toString())) { skipped++; continue; }

    const stageIdStr  = doc.stageId?.toString() || '';
    const pipelineStr = stageToPipelineStr.get(stageIdStr);

    if (!pipelineStr || !taskPipelineSet.has(pipelineStr)) {
      skipped++;
      continue;
    }

    const newTeamId = oldToNewTeam.get(pipelineStr);
    if (!newTeamId) { skipped++; continue; }

    const statusId = stageToStatusId.get(stageIdStr);
    if (!statusId) {
      console.log(`⏭️  No status mapping for stageId ${stageIdStr} — skipping task "${doc.name}" (${doc._id})`);
      skipped++;
      continue;
    }

    const statusDoc = await NEW_STATUSES.findOne({ _id: statusId }, { projection: { type: 1 } });
    const statusType = statusDoc?.type ?? STATUS_TYPES.UNSTARTED;

    const teamKey    = newTeamId.toString();
    const nextNumber = (teamNumberCounters.get(teamKey) ?? 0) + 1;
    teamNumberCounters.set(teamKey, nextNumber);

    bulk.push({
      insertOne: {
        document: {
          _id:               doc._id,
          name:              doc.name              || 'Untitled',
          description:       doc.description,
          status:            statusId,
          statusType,
          teamId:            newTeamId,
          priority:          mapPriority(doc.priority),
          labelIds:          doc.labelIds          || [],
          tagIds:            doc.tagIds            || [],
          assigneeId:        doc.assignedUserIds?.[0] ?? undefined,
          createdBy:         doc.userId,
          startDate:         doc.startDate,
          targetDate:        doc.closeDate,
          statusChangedDate: doc.stageChangedDate  || doc.createdAt || new Date(),
          estimatePoint:     0,
          number:            nextNumber,
          createdAt:         doc.createdAt         || new Date(),
          updatedAt:         doc.modifiedAt        || doc.createdAt || new Date(),
        },
      },
    });

    activityBulk.push({
      insertOne: {
        document: {
          action:    'CREATED',
          contentId: doc._id,
          module:    'NAME',
          metadata:  { newValue: doc.name || 'Untitled', previousValue: undefined },
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
      bulk         = [];
      activityBulk = [];
    }
  }

  if (bulk.length) {
    await NEW_TASKS.bulkWrite(bulk, { ordered: false });
    await NEW_ACTIVITIES.bulkWrite(activityBulk, { ordered: false });
  }

  console.log(`✅ Migrated : ${migrated}  |  Skipped : ${skipped}`);
}


async function migrateComments(): Promise<void> {
  console.log('\n🚀 Step 5 — task_comments → operation_notes');

  const existingIds = await loadExistingIds(NEW_NOTES);
  console.log(`📋 Existing : ${existingIds.size}`);

  const cursor = OLD_COMMENTS
    .find({ content: { $exists: true, $ne: '' } })
    .batchSize(BATCH_SIZE);

  let bulk: any[] = [];
  let migrated = 0;
  let skipped  = 0;

  for await (const doc of cursor) {
    if (!doc) continue;
    if (existingIds.has(doc._id.toString())) { skipped++; continue; }

    if (!doc.content || !doc.typeId || !doc.userId) {
      console.log(`⏭️  Skipping comment ${doc._id} — missing content/typeId/userId`);
      skipped++;
      continue;
    }

    const content = doc.parentId
      ? `*(Reply to comment ${doc.parentId})*\n\n${doc.content}`
      : doc.content;

    bulk.push({
      insertOne: {
        document: {
          _id:       doc._id,
          content,
          contentId: doc.typeId,
          createdBy: doc.userId,
          mentions:  [],
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


async function migrateChecklists(): Promise<void> {
  console.log('\n🚀 Step 6 — tasks_checklists → operation_notes (markdown)');

  const existingIds = await loadExistingIds(NEW_NOTES);
  console.log(`📋 Existing : ${existingIds.size}`);

  const cursor = OLD_CHECKLISTS
    .find({ contentType: 'task' })
    .batchSize(BATCH_SIZE);

  let bulk: any[] = [];
  let migrated = 0;
  let skipped  = 0;

  for await (const checklist of cursor) {
    if (!checklist) continue;

    const noteId = `cl_${checklist._id.toString()}`;

    if (existingIds.has(noteId)) { skipped++; continue; }

    const items = await OLD_CHECKLIST_ITEMS
      .find({ checklistId: checklist._id })
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
          _id:       noteId,
          content,
          contentId: checklist.contentTypeId,
          createdBy: checklist.createdUserId || 'migration',
          mentions:  [],
          createdAt: checklist.createdDate   || new Date(),
          updatedAt: checklist.createdDate   || new Date(),
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

  db = client.db() as Db;

  OLD_PIPELINES       = db.collection('tasks_pipelines');
  OLD_STAGES          = db.collection('tasks_stages');
  OLD_TASKS           = db.collection('tasks');
  OLD_COMMENTS        = db.collection('task_comments');
  OLD_CHECKLISTS      = db.collection('tasks_checklists');
  OLD_CHECKLIST_ITEMS = db.collection('tasks_checklist_items');

  NEW_TEAMS        = db.collection('operation_teams');
  NEW_TEAM_MEMBERS = db.collection('operation_team_members');
  NEW_STATUSES     = db.collection('operation_statuses');
  NEW_TASKS        = db.collection('operation_tasks');
  NEW_NOTES        = db.collection('operation_notes');
  NEW_ACTIVITIES   = db.collection('operation_activities');
  NEW_CYCLES       = db.collection('operation_cycles');

  console.log('═══════════════════════════════════════════════');
  console.log('  Operation task migration');
  console.log(`  MONGO_URL : ${MONGO_URL}`);
  console.log('═══════════════════════════════════════════════');

  await fixLegacyTeamIds().catch((e) => console.log(`❌ Step 0 error: ${e.message}`));
  await fixLegacyStatusIds().catch((e) => console.log(`❌ Step 0b error: ${e.message}`));
  await fixTaskIds().catch((e) => console.log(`❌ Step 0c error: ${e.message}`));

  const oldToNewTeam = await migrateTeams().catch((e) => {
    console.log(`❌ Step 1 error: ${e.message}`);
    return new Map<string, ObjectId>();
  });

  await migrateTeamMembers(oldToNewTeam).catch((e) => console.log(`❌ Step 2 error: ${e.message}`));

  const stageToStatusId = await migrateStatuses(oldToNewTeam).catch((e) => {
    console.log(`❌ Step 3 error: ${e.message}`);
    return new Map<string, ObjectId>();
  });

  await migrateTasks(stageToStatusId, oldToNewTeam).catch((e) => console.log(`❌ Step 4 error: ${e.message}`));
  await migrateComments().catch((e)                           => console.log(`❌ Step 5 error: ${e.message}`));
  await migrateChecklists().catch((e)                         => console.log(`❌ Step 6 error: ${e.message}`));

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Finished at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════');

  process.exit();
};

command();
