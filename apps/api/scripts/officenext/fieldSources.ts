/**
 * Where old field groups and fields are: 3.4's `properties_*`, the older `fields_groups` and
 * `fields` it didn't copy, and the v1 copy's that neither has. Each document is read once, from
 * the first that has it; a repeat in an older collection is counted as skipped there.
 */
import type { Document } from 'mongodb';
import { readAll, type Run } from './run';
import { v1Source } from './sources';
import { idOf } from './values';

interface FieldSourceDoc {
  /** The collection it came from, as the report names it. */
  name: string;
  raw: Document;
}

const SAME = 'same record as in the newer collection';

const read = async (run: Run, current: string, older: string) => {
  const newest = await readAll(run, current);
  const have = new Set(newest.map(idOf));
  const old = await readAll(run, older);
  const kept = old.filter((doc) => !have.has(idOf(doc)));

  run.report.seen(older, old.length - kept.length);
  run.report.skip(older, `${SAME} (${current})`, '', old.length - kept.length);

  const v1 = await v1Source(run, older, [current, older]);
  const office = await v1.db.collection(older).find(v1.filter, { limit: run.limit }).toArray();

  return [
    ...newest.map((raw) => ({ name: current, raw })),
    ...kept.map((raw) => ({ name: older, raw })),
    ...office.map((raw) => ({ name: v1.name, raw })),
  ];
};

const fields = new WeakMap<Run, Promise<FieldSourceDoc[]>>();

/** Every old field group. */
export const groupDocs = (run: Run) => read(run, 'properties_groups', 'fields_groups');

/** Every old field, read once per run (field values ask for them again). */
export const fieldDocs = (run: Run) => {
  const known = fields.get(run) ?? read(run, 'properties_fields', 'fields');

  fields.set(run, known);

  return known;
};
