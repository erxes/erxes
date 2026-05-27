/**
 * =============================================================================
 * Migration: Channel Hierarchy
 * =============================================================================
 *
 *  OLD                          NEW
 *  ─────────────────────────    ─────────────────────────────────────
 *  tickets_boards           →   channels
 *    └─ tickets_pipelines   →     └─ frontline_tickets_pipeline
 *         └─ tickets_stages →            └─ frontline_tickets_pipeline_status
 *
 *  KEY RULE: board._id is preserved as channel._id
 *    tickets_pipelines.boardId → frontline_tickets_pipeline.channelId
 *    (same value, no mapping table needed)
 *
 *  Also:
 *    channel.memberIds[]    →   channel_members  (role-based)
 *    channel.integrationIds →   integration.channelId  (single)
 *    integration.uiOptions  →   restructured { logo, primary }
 *    integration.ticketData →   $unset (replaced by ticketConfigId)
 *
 * USAGE:
 *   cd backend/plugins/frontline_api
 *   MONGO_URL=mongodb://localhost:27017/erxes pnpm migrate:channel:dry
 *   MONGO_URL=mongodb://localhost:27017/erxes pnpm migrate:channel
 *
 * ENV VARS:
 *   MONGO_URL              required
 *   DRY_RUN                "true" → preview, no writes
 *   BATCH_SIZE             default 100
 *   BOARD_TO_CHANNEL_MAP   JSON  { boardId: channelId, … }
 *                          Only needed if you want a board to map to an
 *                          already-existing channel with a different _id.
 * =============================================================================
 */

import { MongoClient, Db, Collection, Document } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';

const DRY_RUN =
  process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100', 10);

// Optional: override specific board → existing channel mappings.
// Usually not needed because board._id IS the channel._id.
const BOARD_TO_CHANNEL_MAP: Record<string, string> = process.env.BOARD_TO_CHANNEL_MAP
  ? JSON.parse(process.env.BOARD_TO_CHANNEL_MAP)
  : {};

// ─── Status type constants ────────────────────────────────────────────────────

const STATUS_TYPES = {
  NEW: 1, OPEN: 2, IN_PROGRESS: 3, RESOLVED: 4, CLOSED: 5, CANCELLED: 6,
} as const;

const STATUS_COLORS: Record<number, string> = {
  1: '#3B82F6', 2: '#F59E0B', 3: '#FBBF24', 4: '#10B981', 5: '#6B7280', 6: '#EF4444',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type RawDoc = Record<string, any>;

interface Stats {
  channelsCreated:   number;
  channelsSkipped:   number;
  membersCreated:    number;
  membersSkipped:    number;
  integrationsSet:   number;
  multiChannelWarn:  number;
  uiMigrated:        number;
  ticketDataUnset:   number;
  pipelinesMigrated: number;
  pipelinesSkipped:  number;
  pipelinesErrors:   number;
  statusesMigrated:  number;
  statusesSkipped:   number;
  statusesErrors:    number;
  errors:            number;
}

// ─── Logging ─────────────────────────────────────────────────────────────────

const log  = (m: string) => console.log(`[${new Date().toISOString()}] ${m}`);
const warn = (m: string) => console.warn(`[WARN]  ${m}`);
const fail = (m: string, e?: unknown) =>
  console.error(`[ERROR] ${m}`, e instanceof Error ? e.message : e ?? '');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchAll(col: Collection<Document>, filter: RawDoc = {}): Promise<RawDoc[]> {
  return col.find(filter).toArray() as unknown as RawDoc[];
}

async function processBatch(
  col: Collection<Document>,
  filter: RawDoc,
  fn: (docs: RawDoc[]) => Promise<void>,
): Promise<void> {
  let skip = 0;
  while (true) {
    const docs = (await col.find(filter).skip(skip).limit(BATCH_SIZE).toArray()) as RawDoc[];
    if (!docs.length) break;
    await fn(docs);
    skip += docs.length;
    if (docs.length < BATCH_SIZE) break;
  }
}

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

function probabilityToNumber(probability?: string): number | undefined {
  if (!probability) return undefined;
  const lower = probability.toLowerCase().trim();
  if (['won', 'done', 'resolved'].includes(lower)) return 100;
  if (lower === 'lost') return 0;
  const n = parseInt(probability.replace('%', ''), 10);
  return isNaN(n) ? undefined : n;
}

function positionToStatusType(pos: number, total: number): number {
  if (total === 1)       return STATUS_TYPES.IN_PROGRESS;
  if (pos === 0)         return STATUS_TYPES.NEW;
  if (pos === 1)         return STATUS_TYPES.OPEN;
  if (pos === total - 1) return STATUS_TYPES.CLOSED;
  if (pos === total - 2) return STATUS_TYPES.RESOLVED;
  return STATUS_TYPES.IN_PROGRESS;
}

// ─── Step 0: tickets_boards → channels ───────────────────────────────────────
//
//  board._id  IS the channel._id  (both are nanoid strings)
//  so pipeline.boardId  ≡  pipeline.channelId  — no translation needed.
//
//  Per-board resolution:
//   1. BOARD_TO_CHANNEL_MAP env var  (use this to point a board at an existing channel)
//   2. Channel with same _id already exists → skip (idempotent)
//   3. Create new channel, _id = board._id

async function migrateBoards(db: Db, s: Stats): Promise<Map<string, string>> {
  log('Step 0: tickets_boards → channels …');

  const boards   = await fetchAll(db.collection('tickets_boards'));
  const Channels = db.collection('channels');

  // Collect pipeline memberIds per board (boards have no memberIds of their own)
  const pipelines  = await fetchAll(db.collection('tickets_pipelines'), { type: 'ticket' });
  const boardMembers = new Map<string, Set<string>>();
  for (const p of pipelines) {
    const bid = p.boardId?.toString() || '';
    if (!boardMembers.has(bid)) boardMembers.set(bid, new Set());
    const set = boardMembers.get(bid)!;
    for (const mid of (p.memberIds || [])) if (mid) set.add(mid);
  }

  const map = new Map<string, string>(); // boardId → channelId

  for (const board of boards) {
    const boardId = board._id.toString();

    // ── 1. Explicit env var override ──────────────────────────────────────
    if (BOARD_TO_CHANNEL_MAP[boardId]) {
      const channelId = BOARD_TO_CHANNEL_MAP[boardId];
      map.set(boardId, channelId);
      log(`  [env]    "${board.name}" (${boardId}) → ${channelId}`);
      s.channelsSkipped++;
      continue;
    }

    // ── 2. Channel with same _id already exists (idempotent) ──────────────
    const existing = await Channels.findOne({ _id: boardId } as RawDoc);
    if (existing) {
      map.set(boardId, boardId);
      log(`  [exists] "${board.name}" (${boardId}) — channel already present`);
      s.channelsSkipped++;
      continue;
    }

    // ── 3. Create channel, preserving board._id ───────────────────────────
    const memberSet = new Set<string>();
    if (board.userId) memberSet.add(board.userId);
    for (const mid of (boardMembers.get(boardId) ?? new Set())) memberSet.add(mid);

    const channelDoc: RawDoc = {
      _id:                   boardId,           // ← board._id preserved
      name:                  board.name         || 'Untitled Channel',
      description:           board.description  ?? '',
      userId:                board.userId       || '',
      memberIds:             [...memberSet],
      createdAt:             board.createdAt    || new Date(),
      createdBy:             board.userId       || '',
      conversationCount:     0,
      openConversationCount: 0,
    };

    if (DRY_RUN) {
      log(`  [create] "${board.name}"  _id: ${boardId}  members: ${[...memberSet].length}`);
      s.channelsCreated++;
    } else {
      try {
        await Channels.insertOne(channelDoc as Document);
        log(`  [create] "${board.name}"  _id: ${boardId}  members: ${[...memberSet].length}`);
        s.channelsCreated++;
      } catch (e) {
        fail(`  channel insert for board "${board.name}" (${boardId})`, e);
        s.errors++;
        continue;
      }
    }

    map.set(boardId, boardId);
  }

  log(`  Boards: ${boards.length}  |  Created: ${s.channelsCreated}  Skipped: ${s.channelsSkipped}\n`);
  return map;
}

// ─── Step 1: channel.memberIds[] → channel_members ───────────────────────────
//   Runs over ALL channels (includes newly created ones from Step 0)

async function migrateChannelMembers(db: Db, s: Stats): Promise<void> {
  log('Step 1: Channel members …');

  const channels = await fetchAll(db.collection('channels'));
  const dest     = db.collection('channel_members');

  for (const ch of channels) {
    const channelId = ch._id.toString();
    const adminId   = ch.userId || ch.createdBy || '';
    const members: string[] = Array.isArray(ch.memberIds) ? ch.memberIds : [];

    for (const memberId of members) {
      if (!memberId) continue;

      if (await dest.findOne({ channelId, memberId } as RawDoc)) {
        s.membersSkipped++;
        continue;
      }

      const role = memberId === adminId ? 'admin' : 'member';

      if (DRY_RUN) {
        log(`  [DRY-RUN] channel_members ← { channelId: ${channelId}, memberId, role: ${role} }`);
        s.membersCreated++;
        continue;
      }

      try {
        await dest.insertOne({
          channelId,
          memberId,
          role,
          createdAt: ch.createdAt || new Date(),
          createdBy: adminId,
        });
        s.membersCreated++;
      } catch (e) {
        fail(`  channel_members insert (${channelId}/${memberId})`, e);
        s.errors++;
      }
    }
  }

  log(`  Created: ${s.membersCreated}, Skipped: ${s.membersSkipped}\n`);
}

// ─── Step 2: channel.integrationIds[] → integration.channelId ────────────────

async function migrateIntegrationChannelId(db: Db, s: Stats): Promise<void> {
  log('Step 2: Integration channelId …');

  const channels     = await fetchAll(db.collection('channels'));
  const Integrations = db.collection('integrations');

  const map = new Map<string, string>();

  for (const ch of channels) {
    const channelId = ch._id.toString();
    for (const id of (ch.integrationIds ?? [])) {
      if (!id) continue;
      if (map.has(id)) {
        warn(`Integration ${id}: multiple channels — keeping first.`);
        s.multiChannelWarn++;
      } else {
        map.set(id, channelId);
      }
    }
  }

  log(`  Mapped ${map.size} integration(s).`);

  for (const [integrationId, channelId] of map) {
    const doc = await Integrations.findOne({ _id: integrationId } as RawDoc);
    if (!doc) { warn(`Integration ${integrationId} not found.`); continue; }
    if (doc.channelId?.toString() === channelId) { s.integrationsSet++; continue; }

    if (DRY_RUN) {
      log(`  [DRY-RUN] integrations.${integrationId} ← channelId: ${channelId}`);
      s.integrationsSet++;
      continue;
    }

    try {
      await Integrations.updateOne({ _id: integrationId } as RawDoc, { $set: { channelId } });
      s.integrationsSet++;
    } catch (e) {
      fail(`  Integration update (${integrationId})`, e);
      s.errors++;
    }
  }

  log(`  channelId set: ${s.integrationsSet}, multi-channel warns: ${s.multiChannelWarn}\n`);
}

// ─── Step 3: integration.uiOptions + ticketData cleanup ──────────────────────

async function migrateIntegrationOptions(db: Db, s: Stats): Promise<void> {
  log('Step 3: Integration uiOptions + ticketData cleanup …');

  const Integrations = db.collection('integrations');

  await processBatch(
    Integrations,
    {
      $or: [
        { 'uiOptions.color':     { $exists: true } },
        { 'uiOptions.textColor': { $exists: true } },
        { 'uiOptions.wallpaper': { $exists: true } },
      ],
    },
    async (docs) => {
      for (const doc of docs) {
        const old = doc.uiOptions ?? {};
        const neo: RawDoc = {
          logo: old.logo,
          ...(old.color || old.textColor
            ? {
                primary: {
                  ...(old.color     ? { DEFAULT:    old.color     } : {}),
                  ...(old.textColor ? { foreground: old.textColor } : {}),
                },
              }
            : {}),
        };

        if (DRY_RUN) {
          log(`  [DRY-RUN] uiOptions ${doc._id}: ${JSON.stringify(old)} → ${JSON.stringify(neo)}`);
          s.uiMigrated++;
          continue;
        }

        try {
          await Integrations.updateOne(
            { _id: doc._id } as RawDoc,
            {
              $set:   { uiOptions: neo },
              $unset: { 'uiOptions.color': '', 'uiOptions.textColor': '', 'uiOptions.wallpaper': '' },
            },
          );
          s.uiMigrated++;
        } catch (e) {
          fail(`  uiOptions (${doc._id})`, e);
          s.errors++;
        }
      }
    },
  );

  const count = await Integrations.countDocuments({ ticketData: { $exists: true } });
  if (count > 0) {
    if (DRY_RUN) {
      log(`  [DRY-RUN] Would $unset ticketData on ${count} integration(s).`);
      s.ticketDataUnset += count;
    } else {
      try {
        const r = await Integrations.updateMany(
          { ticketData: { $exists: true } },
          { $unset: { ticketData: '' } },
        );
        s.ticketDataUnset += r.modifiedCount;
      } catch (e) {
        fail('  ticketData $unset', e);
        s.errors++;
      }
    }
  }

  log(`  uiOptions migrated: ${s.uiMigrated}, ticketData unset: ${s.ticketDataUnset}\n`);
}

// ─── Step 4: tickets_pipelines → frontline_tickets_pipeline ──────────────────
//
//  pipeline.boardId  →  pipeline.channelId
//  Since board._id === channel._id, boardId is already a valid channelId.

async function migratePipelines(
  db: Db,
  boardToChannel: Map<string, string>,
  s: Stats,
): Promise<void> {
  log('Step 4: tickets_pipelines → frontline_tickets_pipeline …');

  const src  = db.collection('tickets_pipelines');
  const dest = db.collection('frontline_tickets_pipeline');

  const filter: RawDoc = { type: 'ticket', status: { $ne: 'archived' } };
  const total = await src.countDocuments(filter);
  log(`  Total: ${total}`);

  await processBatch(src, filter, async (docs) => {
    for (const doc of docs) {
      const _id = doc._id.toString();

      if (await dest.findOne({ _id: doc._id } as RawDoc)) {
        s.pipelinesSkipped++;
        continue;
      }

      // boardId → channelId (same value after Step 0)
      const channelId = boardToChannel.get(doc.boardId?.toString()) || doc.boardId?.toString() || '';
      if (!channelId) {
        warn(`Pipeline "${doc.name}" (${_id}): no channelId — skip.`);
        s.pipelinesErrors++;
        continue;
      }

      const record: RawDoc = {
        _id:                 doc._id,
        name:                doc.name || 'Untitled Pipeline',
        channelId,
        userId:              doc.userId,
        order:               doc.order ?? 0,
        state:               doc.status === 'active' ? 'active' : 'archived',
        visibility:          doc.visibility    || 'public',
        memberIds:           doc.memberIds     || [],
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
        departmentIds:       doc.departmentIds  || [],
        branchIds:           doc.branchIds      || [],
        createdAt:           doc.createdAt      || new Date(),
        updatedAt:           doc.modifiedAt     || doc.createdAt || new Date(),
      };

      if (DRY_RUN) {
        log(`  [DRY-RUN] pipeline "${doc.name}" (${_id}) → channelId: ${channelId}`);
        s.pipelinesMigrated++;
        continue;
      }

      try {
        await dest.insertOne(record as Document);
        s.pipelinesMigrated++;
      } catch (e) {
        fail(`  Pipeline insert (${_id})`, e);
        s.pipelinesErrors++;
      }
    }
  });

  log(`  Migrated: ${s.pipelinesMigrated}, Skipped: ${s.pipelinesSkipped}, Errors: ${s.pipelinesErrors}\n`);
}

// ─── Step 5: tickets_stages → frontline_tickets_pipeline_status ──────────────

async function migrateStatuses(db: Db, s: Stats): Promise<void> {
  log('Step 5: tickets_stages → frontline_tickets_pipeline_status …');

  const src  = db.collection('tickets_stages');
  const dest = db.collection('frontline_tickets_pipeline_status');

  const allStages = (await src
    .find({ type: 'ticket', status: { $ne: 'archived' } })
    .sort({ order: 1 })
    .toArray()) as RawDoc[];

  log(`  Total: ${allStages.length}`);

  const byPipeline = new Map<string, RawDoc[]>();
  for (const stage of allStages) {
    const pid = stage.pipelineId?.toString() || '';
    if (!byPipeline.has(pid)) byPipeline.set(pid, []);
    byPipeline.get(pid)?.push(stage);
  }

  for (const stages of byPipeline.values()) {
    const total = stages.length;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const _id   = stage._id.toString();

      if (await dest.findOne({ _id: stage._id } as RawDoc)) {
        s.statusesSkipped++;
        continue;
      }

      const statusType = stage.probability
        ? probabilityToStatusType(stage.probability)
        : positionToStatusType(i, total);

      const record: RawDoc = {
        _id:              stage._id,
        name:             stage.name || 'Untitled Status',
        pipelineId:       stage.pipelineId,
        type:             statusType,
        order:            i,
        color:            STATUS_COLORS[statusType] ?? '#4F46E5',
        probability:      probabilityToNumber(stage.probability),
        visibilityType:   stage.visibility    || 'public',
        memberIds:        stage.memberIds     || [],
        canMoveMemberIds: stage.canMoveMemberIds || [],
        canEditMemberIds: stage.canEditMemberIds || [],
        departmentIds:    stage.departmentIds  || [],
        state:            stage.status === 'active' ? 'active' : 'archived',
        createdAt:        stage.createdAt     || new Date(),
        updatedAt:        new Date(),
      };

      if (DRY_RUN) {
        log(`  [DRY-RUN] stage "${stage.name}" (${_id}) → type: ${statusType}, order: ${i}`);
        s.statusesMigrated++;
        continue;
      }

      try {
        await dest.insertOne(record as Document);
        s.statusesMigrated++;
      } catch (e) {
        fail(`  Status insert (${_id})`, e);
        s.statusesErrors++;
      }
    }
  }

  log(`  Migrated: ${s.statusesMigrated}, Skipped: ${s.statusesSkipped}, Errors: ${s.statusesErrors}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function migrate(): Promise<void> {
  log('=== Channel Hierarchy Migration ===');
  log(`  tickets_boards → channels  (board._id preserved as channel._id)`);
  log(`  tickets_pipelines.boardId → frontline_tickets_pipeline.channelId`);
  log(`  tickets_stages → frontline_tickets_pipeline_status`);
  log('');
  log(`DRY_RUN:    ${DRY_RUN}`);
  log(`MONGO_URL:  ${MONGO_URL.replace(/\/\/[^@]+@/, '//<hidden>@')}`);
  log('');

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db();
  log(`Connected: ${db.databaseName}\n`);

  const s: Stats = {
    channelsCreated: 0, channelsSkipped: 0,
    membersCreated: 0, membersSkipped: 0,
    integrationsSet: 0, multiChannelWarn: 0,
    uiMigrated: 0, ticketDataUnset: 0,
    pipelinesMigrated: 0, pipelinesSkipped: 0, pipelinesErrors: 0,
    statusesMigrated: 0, statusesSkipped: 0, statusesErrors: 0,
    errors: 0,
  };

  try {
    const boardToChannel = await migrateBoards(db, s);

    await migrateChannelMembers(db, s);
    await migrateIntegrationChannelId(db, s);
    await migrateIntegrationOptions(db, s);
    await migratePipelines(db, boardToChannel, s);
    await migrateStatuses(db, s);
  } finally {
    await client.close();
  }

  log('=== Summary ===');
  log(`channels            created: ${s.channelsCreated}  skipped: ${s.channelsSkipped}`);
  log(`channel_members     created: ${s.membersCreated}  skipped: ${s.membersSkipped}`);
  log(`integrations        set:     ${s.integrationsSet}  multi-ch warns: ${s.multiChannelWarn}`);
  log(`uiOptions migrated:          ${s.uiMigrated}  ticketData unset: ${s.ticketDataUnset}`);
  log(`pipelines  migrated: ${s.pipelinesMigrated}  skipped: ${s.pipelinesSkipped}  errors: ${s.pipelinesErrors}`);
  log(`statuses   migrated: ${s.statusesMigrated}  skipped: ${s.statusesSkipped}  errors: ${s.statusesErrors}`);
  log(`other errors:        ${s.errors}`);

  if (DRY_RUN) log('\nDRY-RUN — no data written.');

  const totalErrors = s.errors + s.pipelinesErrors + s.statusesErrors;
  if (totalErrors > 0) { warn(`\n${totalErrors} error(s) — review logs above.`); process.exit(1); }

  log('\nDone ✅');
}

migrate().catch((err) => { fail('Unhandled error', err); process.exit(1); });
