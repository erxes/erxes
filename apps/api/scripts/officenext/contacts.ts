/**
 * What customers and companies share: old merges, owners, tags and brand tags. Old erxes merged
 * records by marking them `deleted` and listing their ids in the new record's `mergedIds`, so a
 * deleted record becomes an id map entry to the record it went into, not a row.
 */
import type { Collection } from 'mongodb';
import { normalizeEmail, normalizePhone, unique } from '~/lib/contacts';
import { remember, resolve, type IdKind } from './idMap';
import { idSet, insert, MINE, type Run } from './run';
import { brandTagId, type TagType } from './tags';
import { idOf } from './values';

/** Follows `direct` from `id` to the end of its chain (a record not merged again). */
export const finalOf = (direct: Map<string, string>, id: string) => {
  const seen = new Set([id]);
  let current = direct.get(id) ?? id;

  while (direct.has(current) && !seen.has(current)) {
    seen.add(current);
    current = direct.get(current) ?? current;
  }

  return current;
};

/** old id → the record it was merged into, following chains. */
export const survivorsOf = async (collection: Collection) => {
  const direct = new Map<string, string>();

  const docs = await collection
    .find({ 'mergedIds.0': { $exists: true } }, { projection: { mergedIds: 1 } })
    .toArray();

  for (const doc of docs) {
    const mergedIds: unknown = doc.mergedIds;

    if (!Array.isArray(mergedIds)) continue;

    for (const old of mergedIds) {
      if (typeof old === 'string' && old !== idOf(doc)) direct.set(old, idOf(doc));
    }
  }

  return new Map([...direct.keys()].map((old) => [old, finalOf(direct, old)]));
};

/** Writes id map entries for this batch's merged-away records; returns the live ones. */
export const keepLive = async <T extends { id: string; status: string | null }>(
  run: Run,
  collection: string,
  kind: IdKind,
  docs: T[],
  survivors: Map<string, string>,
) => {
  const merged: [string, string][] = [];

  const live = docs.filter((doc) => {
    if (doc.status?.toLowerCase() !== 'deleted') return true;

    const into = survivors.get(doc.id);

    if (into) {
      merged.push([doc.id, into]);
      run.report.note(collection, 'merged in old erxes; id map points at the record kept', doc.id);
    } else run.report.skip(collection, 'deleted in old erxes', doc.id);

    return false;
  });

  await remember(run, collection, kind, merged);

  return live;
};

/** What every contact batch looks up once: members, tags and lead stages. */
export interface Lookups {
  members: Set<string>;
  tags: Map<string, TagType>;
  stages: Map<string, string>;
}

export const lookups = async (run: Run): Promise<Lookups> => {
  const { rows: tags } = await run.pg.query<{ id: string; type: TagType }>(
    `SELECT id, type FROM core_tags WHERE ${MINE}`,
  );

  const { rows: stages } = await run.pg.query<{ id: string; name: string }>(
    `SELECT id, lower(name) AS name FROM core_lead_stages WHERE ${MINE}`,
  );

  return {
    members: await idSet(run, 'core_users'),
    tags: new Map(tags.map((tag) => [tag.id, tag.type])),
    stages: new Map(stages.map((stage) => [stage.name, stage.id])),
  };
};

/** A member id that exists now, or null. */
export const memberOf = (found: Lookups, id: string | null) => {
  const resolved = id && resolve('user', id);

  return resolved && found.members.has(resolved) ? resolved : null;
};

/** Old lead statuses → the organisation's lead stage names (and a disqualify reason). */
const LEAD_STAGES: Record<string, { stage: string; reason?: string }> = {
  new: { stage: 'new' },
  open: { stage: 'new' },
  attemptedtocontact: { stage: 'contacted' },
  connected: { stage: 'engaged' },
  working: { stage: 'engaged' },
  inprogress: { stage: 'engaged' },
  opendeal: { stage: 'engaged' },
  unqualified: { stage: 'disqualified', reason: 'Unqualified' },
  badtiming: { stage: 'disqualified', reason: 'Bad timing' },
  'bad timing': { stage: 'disqualified', reason: 'Bad timing' },
};

/** The lead stage id and disqualify reason for an old lead status. */
export const leadStageOf = (found: Lookups, status: string | null) => {
  const known = status ? LEAD_STAGES[status.toLowerCase()] : undefined;

  return {
    stageId: known ? (found.stages.get(known.stage) ?? null) : null,
    reason: known?.reason ?? null,
    unknown: Boolean(status && !known),
  };
};

/** Join rows record ↔ tag for a batch: old tags and brands (`scopeBrandIds`). */
export const tagLinks = async (
  run: Run,
  found: Lookups,
  target: { collection: string; table: string; column: string; type: TagType },
  records: { id: string; tagIds: string[]; scopeBrandIds: string[] }[],
) => {
  const pairs = new Map<string, [string, string]>();

  for (const record of records) {
    const wanted = [
      ...record.tagIds.map((id) => resolve('tag', id)),
      ...record.scopeBrandIds.map((id) => brandTagId(id, target.type)),
    ];

    for (const tagId of wanted) {
      if (found.tags.get(tagId) === target.type)
        pairs.set(`${record.id}:${tagId}`, [record.id, tagId]);
      else
        run.report.skip(
          `${target.collection} (tags)`,
          'tag missing or of another type',
          `${record.id}:${tagId}`,
        );
    }
  }

  run.report.of(`${target.collection} (tags)`, target.table);
  run.report.seen(`${target.collection} (tags)`, pairs.size);

  await insert(run, {
    collection: `${target.collection} (tags)`,
    table: target.table,
    columns: [target.column, 'tag_id'],
    rows: [...pairs.values()],
    keys: [...pairs.keys()],
  });
};

/** Emails as core keeps them, primary first, no repeats; text with no `@` is dropped. */
export const emailsOf = (primary: string | null, all: string[]) =>
  unique([primary, ...all].map((value) => value && normalizeEmail(value))).filter((value) =>
    value.includes('@'),
  );

/** Phones as core keeps them (no spaces, brackets or dashes), primary first, no repeats. */
export const phonesOf = (primary: string | null, all: string[]) =>
  unique([primary, ...all].map((value) => value && normalizePhone(value)));

/** Each old record's merged ids: everything its survivor map sends to it. */
export const mergedInto = (survivors: Map<string, string>) => {
  const into = new Map<string, string[]>();

  for (const [old, live] of survivors) into.set(live, [...(into.get(live) ?? []), old]);

  return into;
};
