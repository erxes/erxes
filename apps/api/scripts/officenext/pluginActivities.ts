/**
 * The activity Operation and Frontline logged themselves (`operation_activities`,
 * `frontline_ticket_activities`: a module, an action and the old and new value) →
 * `core_activities` on the task, project or ticket, as old erxes history: source `erxes3`, a
 * sentence like "Changed status", and the values in `data`. The record has to still exist in old
 * erxes. "Created note" entries are left out, since the note itself comes in (`notes.ts`).
 */
import type { Document } from 'mongodb';
import { inOrder } from '~/lib/sequence';
import { redact } from './auditLogs';
import { resolve } from './idMap';
import { eachBatch, idSet, insert, type Run } from './run';
import { mainSource, stillThere } from './sources';
import { createdOf, optionalId, plain, readOr, record, text, when } from './values';
import { z } from 'zod';

const Entry = record({
  contentId: optionalId,
  action: text,
  module: text,
  metadata: z.unknown().optional(),
  createdBy: optionalId,
  createdAt: when,
});

type Entry = NonNullable<ReturnType<typeof Entry.parse>>;

/** `START_DATE` → "start date". */
const words = (value: string) => value.toLowerCase().replaceAll('_', ' ');

const VERBS: Record<string, string> = {
  CREATED: 'Set',
  CHANGED: 'Changed',
  REMOVED: 'Removed',
  ACCEPTED: 'Accepted',
  CONVERTED: 'Converted',
};

/** The sentence old erxes showed for an entry. */
export const sentenceOf = (action: string | null, module: string | null) => {
  if (module === 'TRIAGE_ACCEPTANCE') return 'Accepted from triage';

  if (module === 'CONVERT') return 'Converted';

  return [VERBS[action ?? ''] ?? words(action ?? 'Changed'), module ? words(module) : 'record']
    .join(' ')
    .trim();
};

/** The activity type: `operation.task.status_changed`. */
export const typeOf = (targetType: string, action: string | null, module: string | null) =>
  `${targetType}.${[module, action ?? 'changed'].filter(Boolean).join('_').toLowerCase()}`;

const COLUMNS = [
  'id',
  'target_type',
  'target_id',
  'source',
  'type',
  'summary',
  'data',
  'actor_type',
  'actor_id',
  'dedupe_key',
  'occurred_at',
  'created_at',
];

interface Plan {
  collection: string;
  /** Record type → the old collection holding those records. */
  targets: [string, string][];
  noteSkip: string;
}

const PLANS: Plan[] = [
  {
    collection: 'operation_activities',
    targets: [
      ['operation.task', 'operation_tasks'],
      ['operation.project', 'operation_projects'],
    ],
    noteSkip: 'the note itself comes in from operation_notes',
  },
  {
    collection: 'frontline_ticket_activities',
    targets: [['frontline.ticket', 'frontline_tickets']],
    noteSkip: 'the note itself: a ticket comment (plugin:frontline) or an internal note',
  },
];

const rowOf = (entry: Entry, target: [string, string], members: Set<string>) => {
  const actor = entry.createdBy && resolve('user', entry.createdBy);
  const known = actor && members.has(actor) ? actor : null;
  const at = createdOf(entry.id, entry.createdAt);

  return [
    entry.id,
    target[0],
    target[1],
    'erxes3',
    typeOf(target[0], entry.action, entry.module),
    sentenceOf(entry.action, entry.module),
    JSON.stringify(redact({ metadata: plain(entry.metadata ?? null) })),
    known ? 'user' : 'system',
    known,
    `officenext:activity:${entry.id}`,
    at,
    at,
  ];
};

const batchOf = async (run: Run, plan: Plan, members: Set<string>, documents: Document[]) => {
  const name = plan.collection;
  const entries = documents.flatMap((raw) => readOr(Entry, raw) ?? []);
  const contentIds = entries.flatMap((entry) => entry.contentId ?? []);

  const found = await Promise.all(
    plan.targets.map(async ([type, collection]) => ({
      type,
      ids: await stillThere(run.mongo, collection, contentIds),
    })),
  );

  const rows = entries.flatMap((entry) => {
    const target = found.find(({ ids }) => entry.contentId && ids.has(entry.contentId));

    if (entry.module === 'NOTE') run.report.skip(name, plan.noteSkip, entry.id);
    else if (!target || !entry.contentId)
      run.report.skip(name, 'record gone from old erxes', entry.id);

    return target && entry.contentId && entry.module !== 'NOTE'
      ? [rowOf(entry, [target.type, entry.contentId], members)]
      : [];
  });

  await insert(run, {
    collection: name,
    table: 'core_activities',
    columns: COLUMNS,
    rows,
    keys: rows.map((row) => String(row[0])),
  });
};

/** Operation's and Frontline's own activity entries. */
export const importPluginActivities = async (run: Run) => {
  const members = await idSet(run, 'core_users');

  await inOrder(PLANS, async (plan) => {
    const source = mainSource(run, plan.collection);

    run.report.of(source.name, 'core_activities');
    await eachBatch(run, source.db.collection(source.collection), (documents) =>
      batchOf(run, plan, members, documents),
    );
  });
};
