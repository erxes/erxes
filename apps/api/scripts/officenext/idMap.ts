/**
 * `officenext_import.id_map`: old ids that merged into another row (a member whose email was
 * already taken, a tag whose name was). Every importer resolves user, customer, company, tag,
 * product, unit and field ids through it, `coalesce(new_id, old_id)`; an id with no row is kept.
 */
import { insert, type Run } from './run';

export type IdKind =
  | 'user'
  | 'customer'
  | 'company'
  | 'tag'
  | 'product'
  | 'product_category'
  | 'unit'
  | 'field'
  | 'brand'
  | 'role';

const maps = new Map<IdKind, Map<string, string>>();

export const createIdMap = async (run: Run) => {
  await run.pg.query('CREATE SCHEMA IF NOT EXISTS officenext_import');
  await run.pg.query(
    'CREATE TABLE IF NOT EXISTS officenext_import.id_map (kind text NOT NULL, old_id text NOT NULL, new_id text NOT NULL, PRIMARY KEY (kind, old_id))',
  );
};

export const loadIdMap = async (run: Run) => {
  const { rows } = await run.pg.query<{ kind: IdKind; old_id: string; new_id: string }>(
    'SELECT kind, old_id, new_id FROM officenext_import.id_map',
  );

  maps.clear();

  for (const row of rows) mapOf(row.kind).set(row.old_id, row.new_id);
};

const mapOf = (kind: IdKind) => {
  const map = maps.get(kind) ?? new Map<string, string>();

  maps.set(kind, map);

  return map;
};

/** The id an old id lives under now. */
export const resolve = (kind: IdKind, id: string) => maps.get(kind)?.get(id) ?? id;

/**
 * Records merges (`[old, new]`), in this unit. With `everyId`, ids that stay the same get a row
 * too (fields: plugin importers look every one up).
 */
export const remember = async (
  run: Run,
  collection: string,
  kind: IdKind,
  pairs: [string, string][],
  everyId = false,
) => {
  const fresh = pairs.filter(([old, id]) => (everyId || old !== id) && mapOf(kind).get(old) !== id);

  for (const [old, id] of fresh) mapOf(kind).set(old, id);

  await insert(run, {
    collection: `${collection} (id_map)`,
    table: 'officenext_import.id_map',
    columns: ['kind', 'old_id', 'new_id'],
    rows: fresh.map(([old, id]) => [kind, old, id]),
    keys: fresh.map(([old]) => old),
    conflict:
      'ON CONFLICT (kind, old_id) DO UPDATE SET new_id = excluded.new_id WHERE id_map.new_id IS DISTINCT FROM excluded.new_id',
  });
};
