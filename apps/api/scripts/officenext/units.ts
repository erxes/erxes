/**
 * `branches`, `departments`, `units` and `structures` → `core_org_units`. Branches take the
 * Branch type and kind; departments the Department type; old units (teams) the Team type under
 * their department; the structure (the company itself) the Company type. A parent that is
 * missing, deleted or of the other kind puts the unit at the top. A code taken within its kind
 * gets a suffix. Deleted units stay out. Members come from both sides: the member's
 * `branchIds`/`departmentIds` and the unit's `userIds`.
 */
import type { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { resolve } from './idMap';
import { idSet, insert, MINE, readAll, type Run, unit } from './run';
import { createdOf, ids, optionalId, readOr, record, text, when } from './values';

type Kind = 'branch' | 'department';

const Source = record({
  title: text,
  code: text,
  parentId: optionalId,
  departmentId: optionalId,
  supervisorId: optionalId,
  description: text,
  address: text,
  phoneNumber: text,
  email: text,
  status: text,
  userIds: ids,
  createdBy: optionalId,
  createdAt: when,
  updatedAt: when,
});

type Source = z.infer<typeof Source>;

/** Each source collection: its kind, the type code, and which field names the parent. */
const SOURCES = [
  { collection: 'structures', kind: 'department', type: 'company', parent: null },
  { collection: 'departments', kind: 'department', type: 'department', parent: 'parentId' },
  { collection: 'units', kind: 'department', type: 'team', parent: 'departmentId' },
  { collection: 'branches', kind: 'branch', type: 'branch', parent: 'parentId' },
] as const;

export interface Unit {
  id: string;
  collection: string;
  kind: Kind;
  typeCode: string;
  parentId: string | null;
  doc: Source;
}

/** Each unit's path (`/root/…/id/`), with parents that don't resolve, or loop, dropped. */
type Placed = Pick<Unit, 'id' | 'kind' | 'parentId'>;

export const placeUnits = (units: Placed[]) => {
  const byId = new Map(units.map((each) => [each.id, each]));
  const paths = new Map<string, string>();
  const orphans = new Set<string>();

  const pathOf = (each: Placed, trail: Set<string>): string => {
    const known = paths.get(each.id);

    if (known) return known;

    const parent = each.parentId ? byId.get(each.parentId) : undefined;
    const fits = parent && parent.kind === each.kind && !trail.has(parent.id);

    if (each.parentId && !fits) orphans.add(each.id);

    const path = `${fits ? pathOf(parent, new Set([...trail, each.id])) : '/'}${each.id}/`;

    paths.set(each.id, path);

    return path;
  };

  for (const each of units) pathOf(each, new Set([each.id]));

  return { paths, orphans };
};

/** Codes unique per kind (case-insensitive): a taken one gets `-2`, `-3` … */
export const uniqueCode = (taken: Set<string>, kind: Kind, code: string | null) => {
  if (!code) return null;

  let candidate = code;

  for (let n = 2; taken.has(`${kind}:${candidate.toLowerCase()}`); n += 1) {
    candidate = `${code}-${n}`;
  }

  taken.add(`${kind}:${candidate.toLowerCase()}`);

  return candidate;
};

const readUnits = async (run: Run) =>
  (
    await Promise.all(
      SOURCES.map(async (source) => {
        const docs = await readAll(run, source.collection);

        run.report.of(source.collection, 'core_org_units');
        run.report.seen(source.collection, docs.length);

        return docs.flatMap((raw): Unit[] => {
          const doc = readOr(Source, raw);

          if (!doc) return [];

          if (doc.status === 'deleted') {
            run.report.skip(source.collection, 'deleted in old erxes', doc.id);

            return [];
          }

          const parentId = source.parent ? doc[source.parent] : null;

          return [
            {
              id: doc.id,
              collection: source.collection,
              kind: source.kind,
              typeCode: source.type,
              parentId,
              doc,
            },
          ];
        });
      }),
    )
  ).flat();

const rowsOf = async (run: Run, units: Unit[]) => {
  const { rows: types } = await run.pg.query<{ id: string; kind: Kind; code: string }>(
    `SELECT id, kind, lower(code) AS code FROM core_org_unit_types WHERE code IS NOT NULL AND ${MINE}`,
  );

  const typeOf = new Map(types.map((type) => [`${type.kind}:${type.code}`, type.id]));

  const { rows: codes } = await run.pg.query<{ id: string; key: string }>(
    `SELECT id, kind || ':' || lower(code) AS key FROM core_org_units WHERE code IS NOT NULL AND ${MINE}`,
  );

  const mine = new Set(units.map((each) => each.id));
  const taken = new Set(codes.filter((row) => !mine.has(row.id)).map((row) => row.key));
  const members = await idSet(run, 'core_users');
  const { paths, orphans } = placeUnits(units);

  const member = (id: string | null) => {
    const resolved = id && resolve('user', id);

    return resolved && members.has(resolved) ? resolved : null;
  };

  const ordered = units.toSorted(
    (a, b) => (paths.get(a.id) ?? '').length - (paths.get(b.id) ?? '').length,
  );

  return ordered.flatMap((each) => {
    const typeId = typeOf.get(`${each.kind}:${each.typeCode}`);

    if (!typeId) {
      run.report.skip(each.collection, `no ${each.kind} type with code ${each.typeCode}`, each.id);

      return [];
    }

    if (orphans.has(each.id)) {
      run.report.note(each.collection, 'parent missing or deleted; put at the top', each.id);
    }

    const code = uniqueCode(taken, each.kind, each.doc.code);

    if (code !== each.doc.code) {
      run.report.note(each.collection, `code taken in its kind; now ${code}`, each.id);
    }

    const path = paths.get(each.id) ?? `/${each.id}/`;
    const parentId = path.split('/').at(-3) || null;

    return [
      {
        collection: each.collection,
        id: each.id,
        row: [
          each.id,
          each.kind,
          each.doc.title ?? each.doc.code ?? each.id,
          code,
          parentId,
          path,
          member(each.doc.supervisorId),
          each.doc.description,
          each.doc.address,
          each.doc.phoneNumber,
          each.doc.email,
          member(each.doc.createdBy),
          createdOf(each.id, each.doc.createdAt, each.doc.updatedAt),
          each.doc.updatedAt ?? createdOf(each.id, each.doc.createdAt),
          typeId,
        ],
      },
    ];
  });
};

const COLUMNS = [
  'id',
  'kind',
  'name',
  'code',
  'parent_id',
  'path',
  'supervisor_id',
  'description',
  'address',
  'phone',
  'email',
  'created_by',
  'created_at',
  'updated_at',
  'type_id',
];

/** Units, then who is in them. `users` are the parsed old members. */
export const importUnits = async (
  run: Run,
  users: { id: string; branchIds: string[]; departmentIds: string[] }[],
) => {
  const units = await readUnits(run);
  const rows = await rowsOf(run, units);

  // One at a time, parents' collections first: rows share the connection and its savepoints.
  await unit(run, () =>
    inOrder(SOURCES, (source) => {
      const mine = rows.filter((each) => each.collection === source.collection);

      return insert(run, {
        collection: source.collection,
        table: 'core_org_units',
        columns: COLUMNS,
        rows: mine.map((each) => each.row),
        keys: mine.map((each) => each.id),
      });
    }),
  );

  await importMembers(run, units, users);
};

const importMembers = async (
  run: Run,
  units: Unit[],
  users: { id: string; branchIds: string[]; departmentIds: string[] }[],
) => {
  const present = await idSet(run, 'core_org_units');
  const members = await idSet(run, 'core_users');
  const pairs = new Map<string, [string, string]>();

  const add = (unitId: string, userId: string) => {
    const user = resolve('user', userId);

    if (present.has(unitId) && members.has(user)) pairs.set(`${unitId}:${user}`, [unitId, user]);
    else
      run.report.skip(
        'users (unit members)',
        'unit deleted or member missing',
        `${unitId}:${userId}`,
      );
  };

  for (const each of units) for (const userId of each.doc.userIds) add(each.id, userId);

  for (const user of users) {
    for (const unitId of [...user.branchIds, ...user.departmentIds]) add(unitId, user.id);
  }

  run.report.of('users (unit members)', 'core_org_unit_members');
  run.report.seen('users (unit members)', pairs.size);

  await unit(run, () =>
    insert(run, {
      collection: 'users (unit members)',
      table: 'core_org_unit_members',
      columns: ['unit_id', 'user_id'],
      rows: [...pairs.values()],
      keys: [...pairs.keys()],
    }),
  );
};
