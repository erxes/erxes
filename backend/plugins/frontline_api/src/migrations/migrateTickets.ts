import * as dotenv from 'dotenv';
dotenv.config();

import { Collection, Db, Document, MongoClient } from 'mongodb';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } = process.env;

if (!MONGO_URL) throw new Error('Environment variable MONGO_URL not set.');

const DRY_RUN = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');
const BATCH_SIZE = 1000;

// ---------------------------------------------------------------------------
// MongoDB
// ---------------------------------------------------------------------------

const client = new MongoClient(MONGO_URL);
let db: Db;

// Source (old)
let OLD_BOARDS: Collection;
let OLD_PIPELINES: Collection;
let OLD_STAGES: Collection;
let OLD_TICKETS: Collection;
let OLD_COMMENTS: Collection;
let OLD_CHECKLISTS: Collection;
let OLD_CHECKLIST_ITEMS: Collection;

// Target (new)
let NEW_CHANNELS: Collection;   // boards → frontline_channels
let NEW_PIPELINES: Collection;
let NEW_STATUSES: Collection;
let NEW_TICKETS: Collection;
let NEW_NOTES: Collection;
let NEW_ACTIVITIES: Collection;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_TYPES = {
  NEW: 1, OPEN: 2, IN_PROGRESS: 3, RESOLVED: 4, CLOSED: 5, CANCELLED: 6,
} as const;

const STATUS_COLORS: Record<number, string> = {
  1: '#3B82F6', 2: '#F59E0B', 3: '#FBBF24', 4: '#10B981', 5: '#6B7280', 6: '#EF4444',
};

const VALID_TICKET_TYPES = new Set(['bug', 'ticket', 'feature', 'question', 'incident']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log  = (m: string) => console.log(`[${new Date().toISOString()}] ${m}`);
const warn = (m: string) => console.warn(`[WARN]  ${m}`);
const fail = (m: string, e?: unknown) =>
  console.error(`[ERROR] ${m}`, e instanceof Error ? e.message : e ?? '');

type RawDoc = Record<string, any>;

function probabilityToStatusType(probability?: string): number {
  switch (probability?.toLowerCase().trim()) {
    case 'won':
    case 'done':     return STATUS_TYPES.CLOSED;
    case 'lost':     return STATUS_TYPES.CANCELLED;
    case 'resolved': return STATUS_TYPES.RESOLVED;
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
  if (total === 1)       return STATUS_TYPES.IN_PROGRESS;
  if (pos === 0)         return STATUS_TYPES.NEW;
  if (pos === 1)         return STATUS_TYPES.OPEN;
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
    case 'minor':    return 1;
    case 'medium':   return 2;
    case 'high':     return 3;
    case 'critical': return 4;
    default:         return 0;
  }
}

function normalizeTicketType(t?: string): string {
  const lower = t?.toLowerCase() ?? '';
  return VALID_TICKET_TYPES.has(lower) ? lower : 'ticket';
}

// ---------------------------------------------------------------------------
// Step 1: tickets_boards → frontline_channels
//   board._id is preserved as channel._id  (both are nanoid strings)
// ---------------------------------------------------------------------------

async function migrateBoards(): Promise<Map<string, string>> {
  log('Step 1: tickets_boards → frontline_channels …');

  const boards = (await OLD_BOARDS.find({}).toArray()) as RawDoc[];

  // Collect pipeline memberIds per board (boards have no memberIds themselves)
  const pipelines  = (await OLD_PIPELINES.find({ type: 'ticket' }).toArray()) as RawDoc[];
  const boardMembers = new Map<string, Set<string>>();
  for (const p of pipelines) {
    const bid = p.boardId?.toString() || '';
    if (!boardMembers.has(bid)) boardMembers.set(bid, new Set());
    const set = boardMembers.get(bid) ?? new Set<string>();
    for (const mid of (p.memberIds || [])) if (mid) set.add(mid);
    boardMembers.set(bid, set);
  }

  let created = 0;
  let skipped = 0;
  const boardToChannel = new Map<string, string>(); // boardId → channelId (same value)

  for (const board of boards) {
    const boardId = board._id.toString();

    const existing = await NEW_CHANNELS.findOne({ _id: boardId } as RawDoc);
    if (existing) {
      boardToChannel.set(boardId, boardId);
      skipped++;
      continue;
    }

    const memberSet = new Set<string>();
    if (board.userId) memberSet.add(board.userId);
    for (const mid of (boardMembers.get(boardId) ?? new Set())) memberSet.add(mid);

    const doc: RawDoc = {
      _id:                   boardId,       // board._id preserved as channel._id
      name:                  board.name         || 'Untitled',
      description:           board.description  ?? '',
      userId:                board.userId        || '',
      memberIds:             [...memberSet],
      createdAt:             board.createdAt     || new Date(),
      createdBy:             board.userId        || '',
      conversationCount:     0,
      openConversationCount: 0,
    };

    if (DRY_RUN) {
      log(`  [DRY] channel "${board.name}" (_id: ${boardId})`);
    } else {
      try {
        await NEW_CHANNELS.insertOne(doc as Document);
      } catch (e) {
        fail(`  board → channel (${boardId})`, e);
        continue;
      }
    }

    boardToChannel.set(boardId, boardId);
    created++;
  }

  log(`  created: ${created}  skipped: ${skipped}\n`);
  return boardToChannel;
}

// ---------------------------------------------------------------------------
// Step 2: tickets_pipelines → frontline_tickets_pipeline
// ---------------------------------------------------------------------------

async function migratePipelines(boardToChannel: Map<string, string>): Promise<void> {
  log('Step 2: tickets_pipelines → frontline_tickets_pipeline …');

  const filter: RawDoc = { type: 'ticket', status: { $ne: 'archived' } };
  const total = await OLD_PIPELINES.countDocuments(filter);
  log(`  total: ${total}`);

  let migrated = 0;
  let skipped  = 0;
  let errors   = 0;
  let skip     = 0;

  while (true) {
    const docs = (await OLD_PIPELINES.find(filter).skip(skip).limit(BATCH_SIZE).toArray()) as RawDoc[];
    if (!docs.length) break;

    for (const doc of docs) {
      const _id = doc._id.toString();

      if (await NEW_PIPELINES.findOne({ _id: doc._id } as RawDoc)) { skipped++; continue; }

      // boardId → channelId (same value — board._id was preserved as channel._id)
      const channelId = boardToChannel.get(doc.boardId?.toString()) || doc.boardId?.toString() || '';
      if (!channelId) { warn(`Pipeline "${doc.name}" (${_id}): no channelId`); errors++; continue; }

      const record: RawDoc = {
        _id:                 doc._id,
        name:                doc.name             || 'Untitled Pipeline',
        channelId,
        userId:              doc.userId,
        order:               doc.order            ?? 0,
        state:               doc.status === 'active' ? 'active' : 'archived',
        visibility:          doc.visibility       || 'public',
        memberIds:           doc.memberIds        || [],
        tagId:               doc.tagId,
        isCheckDate:         doc.isCheckDate,
        isCheckUser:         doc.isCheckUser,
        isCheckDepartment:   doc.isCheckDepartment,
        isCheckBranch:       doc.isCheckBranch,
        isHideName:          doc.isHideName,
        excludeCheckUserIds: doc.excludeCheckUserIds || [],
        numberConfig:        doc.numberConfig,
        numberSize:          doc.numberSize,
        nameConfig:          doc.nameConfig,
        lastNum:             doc.lastNum,
        departmentIds:       doc.departmentIds    || [],
        branchIds:           doc.branchIds        || [],
        createdAt:           doc.createdAt        || new Date(),
        updatedAt:           doc.modifiedAt       || doc.createdAt || new Date(),
      };

      if (DRY_RUN) { log(`  [DRY] pipeline "${doc.name}" → channelId: ${channelId}`); migrated++; continue; }

      try { await NEW_PIPELINES.insertOne(record as Document); migrated++; }
      catch (e) { fail(`  pipeline (${_id})`, e); errors++; }
    }

    skip += docs.length;
    if (docs.length < BATCH_SIZE) break;
  }

  log(`  migrated: ${migrated}  skipped: ${skipped}  errors: ${errors}\n`);
}

// ---------------------------------------------------------------------------
// Step 3: tickets_stages → frontline_tickets_pipeline_status
// ---------------------------------------------------------------------------

async function migrateStatuses(): Promise<void> {
  log('Step 3: tickets_stages → frontline_tickets_pipeline_status …');

  const allStages = (await OLD_STAGES
    .find({ type: 'ticket', status: { $ne: 'archived' } })
    .sort({ order: 1 })
    .toArray()) as RawDoc[];

  log(`  total: ${allStages.length}`);

  // Group by pipelineId to derive position-based status types
  const byPipeline = new Map<string, RawDoc[]>();
  for (const s of allStages) {
    const pid = s.pipelineId?.toString() || '';
    if (!byPipeline.has(pid)) byPipeline.set(pid, []);
    byPipeline.get(pid)?.push(s);
  }

  let migrated = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const stages of byPipeline.values()) {
    const total = stages.length;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const _id   = stage._id.toString();

      if (await NEW_STATUSES.findOne({ _id: stage._id } as RawDoc)) { skipped++; continue; }

      const statusType = stage.probability
        ? probabilityToStatusType(stage.probability)
        : positionToStatusType(i, total);

      const record: RawDoc = {
        _id:              stage._id,
        name:             stage.name            || 'Untitled Status',
        pipelineId:       stage.pipelineId,
        type:             statusType,
        order:            i,
        color:            STATUS_COLORS[statusType] ?? '#4F46E5',
        probability:      probabilityToNumber(stage.probability),
        visibilityType:   stage.visibility      || 'public',
        memberIds:        stage.memberIds       || [],
        canMoveMemberIds: stage.canMoveMemberIds || [],
        canEditMemberIds: stage.canEditMemberIds || [],
        departmentIds:    stage.departmentIds   || [],
        state:            stage.status === 'active' ? 'active' : 'archived',
        createdAt:        stage.createdAt       || new Date(),
        updatedAt:        new Date(),
      };

      if (DRY_RUN) { log(`  [DRY] stage "${stage.name}" → type: ${statusType}, order: ${i}`); migrated++; continue; }

      try { await NEW_STATUSES.insertOne(record as Document); migrated++; }
      catch (e) { fail(`  status (${_id})`, e); errors++; }
    }
  }

  log(`  migrated: ${migrated}  skipped: ${skipped}  errors: ${errors}\n`);
}

// ---------------------------------------------------------------------------
// Step 4: tickets → frontline_tickets
// ---------------------------------------------------------------------------

async function migrateTickets(): Promise<void> {
  log('Step 4: tickets → frontline_tickets …');

  // Build stage → pipelineId lookup
  const allStages = (await OLD_STAGES.find({}).toArray()) as RawDoc[];
  const stageToPipeline = new Map<string, string>(
    allStages.map((s) => [s._id.toString(), s.pipelineId?.toString() || '']),
  );

  // Build pipelineId → channelId from already-migrated pipelines
  const allPipelines = (await NEW_PIPELINES.find({}).toArray()) as RawDoc[];
  const pipelineToChannel = new Map<string, string>(
    allPipelines.map((p) => [p._id.toString(), p.channelId?.toString() || '']),
  );

  const filter: RawDoc = { type: { $ne: 'deal' } };
  const total = await OLD_TICKETS.countDocuments(filter);
  log(`  total: ${total}`);

  let migrated = 0;
  let skipped  = 0;
  let errors   = 0;
  let skip     = 0;

  while (true) {
    const docs = (await OLD_TICKETS.find(filter).skip(skip).limit(BATCH_SIZE).toArray()) as RawDoc[];
    if (!docs.length) break;

    for (const doc of docs) {
      const _id = doc._id.toString();

      if (await NEW_TICKETS.findOne({ _id: doc._id } as RawDoc)) { skipped++; continue; }

      const pipelineId = stageToPipeline.get(doc.stageId?.toString() || '') || '';
      const channelId  = pipelineToChannel.get(pipelineId) || '';

      if (!pipelineId) warn(`Ticket ${_id}: no pipeline (stageId=${doc.stageId})`);
      if (!channelId)  warn(`Ticket ${_id}: no channelId (pipelineId=${pipelineId})`);

      // watchedUserIds + notifiedUserIds → subscribedUserIds (deduped)
      const subscribedUserIds = [
        ...new Set<string>([
          ...(doc.watchedUserIds  || []),
          ...(doc.notifiedUserIds || []),
        ]),
      ];

      // customFieldsData [{field, value}] → propertiesData {fieldId: value}
      let propertiesData: Record<string, unknown> | undefined;
      if (Array.isArray(doc.customFieldsData) && doc.customFieldsData.length) {
        propertiesData = {};
        for (const cf of doc.customFieldsData) {
          if (cf.field) propertiesData[cf.field] = cf.value ?? cf.stringValue;
        }
      }

      const record: RawDoc = {
        _id:               doc._id,
        name:              doc.name          || 'Untitled',
        description:       doc.description,
        channelId,
        pipelineId,
        statusId:          doc.stageId,       // stageId → statusId
        stageId:           doc.stageId,
        type:              normalizeTicketType(doc.type),
        priority:          mapPriority(doc.priority),
        assigneeId:        doc.assignedUserIds?.[0] ?? undefined,
        createdBy:         doc.userId,
        userId:            doc.userId,
        attachments:       doc.attachments   || [],
        labelIds:          doc.labelIds      || [],
        tagIds:            doc.tagIds        || [],
        startDate:         doc.startDate,
        targetDate:        doc.closeDate,     // closeDate → targetDate
        statusChangedDate: doc.stageChangedDate || doc.createdAt || new Date(),
        number:            doc.number,
        statusType:        0,
        subscribedUserIds,
        propertiesData,
        companyIds:        doc.companyIds    || [],
        ...(doc.sourceConversationIds?.length
          ? { customerFieldData: { sourceConversationIds: doc.sourceConversationIds } }
          : {}),
        state:     doc.status === 'archived' ? 'archived' : 'active',
        createdAt: doc.createdAt             || new Date(),
        updatedAt: doc.modifiedAt            || doc.createdAt || new Date(),
      };

      if (DRY_RUN) { log(`  [DRY] ticket "${doc.name}" (${_id})`); migrated++; continue; }

      try {
        await NEW_TICKETS.insertOne(record as Document);
        await NEW_ACTIVITIES.insertOne({
          action:    'CREATED',
          contentId: doc._id,
          module:    'NAME',
          metadata:  { newValue: doc.name || 'Untitled', previousValue: undefined },
          createdBy: doc.userId || 'migration',
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.createdAt || new Date(),
        });
        migrated++;
      } catch (e) {
        fail(`  ticket (${_id})`, e);
        errors++;
      }
    }

    skip += docs.length;
    if (docs.length < BATCH_SIZE) break;
  }

  log(`  migrated: ${migrated}  skipped: ${skipped}  errors: ${errors}\n`);
}

// ---------------------------------------------------------------------------
// Step 5: ticket_comments → frontline_tickets_notes
// ---------------------------------------------------------------------------

async function migrateComments(): Promise<void> {
  log('Step 5: ticket_comments → frontline_tickets_notes …');

  const filter: RawDoc = { content: { $exists: true, $ne: '' } };
  const total = await OLD_COMMENTS.countDocuments(filter);
  log(`  total: ${total}`);

  let migrated = 0;
  let skipped  = 0;
  let errors   = 0;
  let skip     = 0;

  while (true) {
    const docs = (await OLD_COMMENTS.find(filter).skip(skip).limit(BATCH_SIZE).toArray()) as RawDoc[];
    if (!docs.length) break;

    for (const doc of docs) {
      const _id = doc._id.toString();

      if (await NEW_NOTES.findOne({ _id: doc._id } as RawDoc)) { skipped++; continue; }

      if (!doc.content || !doc.typeId || !doc.userId) {
        warn(`Comment ${_id}: missing content/typeId/userId — skipped.`);
        skipped++;
        continue;
      }

      // Replies: prefix with reference to parent
      const content = doc.parentId
        ? `*(Reply to comment ${doc.parentId})*\n\n${doc.content}`
        : doc.content;

      const record: RawDoc = {
        _id:       doc._id,
        content,
        contentId: doc.typeId,    // typeId = ticket _id
        createdBy: doc.userId,
        mentions:  [],
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.createdAt || new Date(),
      };

      if (DRY_RUN) { log(`  [DRY] comment ${_id} → note for ticket ${doc.typeId}`); migrated++; continue; }

      try { await NEW_NOTES.insertOne(record as Document); migrated++; }
      catch (e) { fail(`  comment (${_id})`, e); errors++; }
    }

    skip += docs.length;
    if (docs.length < BATCH_SIZE) break;
  }

  log(`  migrated: ${migrated}  skipped: ${skipped}  errors: ${errors}\n`);
}

// ---------------------------------------------------------------------------
// Step 6: tickets_checklists + items → frontline_tickets_notes  (markdown)
// ---------------------------------------------------------------------------

async function migrateChecklists(): Promise<void> {
  log('Step 6: tickets_checklists → frontline_tickets_notes (markdown) …');

  const filter: RawDoc = { contentType: 'ticket' };
  const total = await OLD_CHECKLISTS.countDocuments(filter);
  log(`  total: ${total}`);

  let migrated = 0;
  let skipped  = 0;
  let errors   = 0;
  let skip     = 0;

  while (true) {
    const docs = (await OLD_CHECKLISTS.find(filter).skip(skip).limit(BATCH_SIZE).toArray()) as RawDoc[];
    if (!docs.length) break;

    for (const checklist of docs) {
      const checklistId = checklist._id.toString();
      const noteId      = `cl_${checklistId}`; // stable, collision-free _id

      if (await NEW_NOTES.findOne({ _id: noteId } as RawDoc)) { skipped++; continue; }

      const items = (await OLD_CHECKLIST_ITEMS
        .find({ checklistId: checklist._id } as RawDoc)
        .sort({ order: 1 })
        .toArray()) as RawDoc[];

      const lines = items
        .map((item) => `- [${item.isChecked ? 'x' : ' '}] ${item.content}`)
        .join('\n');

      const content =
        `**${checklist.title || 'Checklist'}**\n\n` +
        (lines || '*(empty checklist)*');

      const record: RawDoc = {
        _id:       noteId,
        content,
        contentId: checklist.contentTypeId,    // ticket _id
        createdBy: checklist.createdUserId || 'migration',
        mentions:  [],
        createdAt: checklist.createdDate   || new Date(),
        updatedAt: checklist.createdDate   || new Date(),
      };

      if (DRY_RUN) {
        log(`  [DRY] checklist "${checklist.title}" (${checklistId}) — ${items.length} item(s)`);
        migrated++;
        continue;
      }

      try { await NEW_NOTES.insertOne(record as Document); migrated++; }
      catch (e) { fail(`  checklist (${checklistId})`, e); errors++; }
    }

    skip += docs.length;
    if (docs.length < BATCH_SIZE) break;
  }

  log(`  migrated: ${migrated}  skipped: ${skipped}  errors: ${errors}\n`);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const command = async () => {
  log('=== Ticket Migration ===');
  log(`DRY_RUN:   ${DRY_RUN}`);
  log(`MONGO_URL: ${MONGO_URL.replace(/\/\/[^@]+@/, '//<hidden>@')}`);
  log('');

  await client.connect();
  db = client.db() as Db;

  // Source collections
  OLD_BOARDS          = db.collection('tickets_boards');
  OLD_PIPELINES       = db.collection('tickets_pipelines');
  OLD_STAGES          = db.collection('tickets_stages');
  OLD_TICKETS         = db.collection('tickets');
  OLD_COMMENTS        = db.collection('ticket_comments');
  OLD_CHECKLISTS      = db.collection('tickets_checklists');
  OLD_CHECKLIST_ITEMS = db.collection('tickets_checklist_items');

  // Target collections
  NEW_CHANNELS   = db.collection('channels');
  NEW_PIPELINES  = db.collection('frontline_tickets_pipeline');
  NEW_STATUSES   = db.collection('frontline_tickets_pipeline_status');
  NEW_TICKETS    = db.collection('frontline_tickets');
  NEW_NOTES      = db.collection('frontline_tickets_notes');
  NEW_ACTIVITIES = db.collection('frontline_ticket_activities');

  log(`Connected: ${db.databaseName}\n`);

  try {
    const boardToChannel = await migrateBoards();
    await migratePipelines(boardToChannel);
    await migrateStatuses();
    await migrateTickets();
    await migrateComments();
    await migrateChecklists();
  } finally {
    await client.close();
  }

  log('Done ✅');
};

command().catch((err) => {
  fail('Migration failed', err);
  process.exit(1);
});
