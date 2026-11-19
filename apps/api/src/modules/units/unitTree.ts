import { UNIT_MAX } from '@erxes/core-contract';
import { type Db, orgUnits } from '@erxes/core-db';
import { and, asc, desc, eq, gt, ilike, inArray, ne, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { fail, notFound } from '~/http/errors';
import { containsPattern } from '~/lib/keyset';
import { matchEveryWord } from '~/lib/search';
import { unitInReach, unitShown } from '~/modules/reach/reach';
import { listed, nodeColumns, pathSteps, reachable } from './unitRows';

const above = alias(orgUnits, 'above_unit');

const place = sql`(${orgUnits.sortOrder}, ${orgUnits.name}, ${orgUnits.id})`;
const inPlace = [asc(orgUnits.sortOrder), asc(orgUnits.name), asc(orgUnits.id)];

const pathOf = async (client: Db, id: string) => {
  const [unit] = await client
    .select({ path: orgUnits.path })
    .from(orgUnits)
    .where(and(eq(orgUnits.id, id), unitShown(orgUnits)));

  if (!unit) throw notFound('Unit');

  return unit.path;
};

export const unitChildren = async (
  client: Db,
  query: { id: string; cursor?: string; limit: number; includeInactive?: boolean },
) => {
  await pathOf(client, query.id);

  const includeInactive = query.includeInactive ?? false;

  const under = and(
    eq(orgUnits.parentId, query.id),
    listed(orgUnits, includeInactive),
    unitShown(orgUnits),
  );

  if (query.cursor) {
    const [anchor] = await client
      .select({ id: orgUnits.id })
      .from(orgUnits)
      .where(and(eq(orgUnits.parentId, query.id), eq(orgUnits.id, query.cursor)));

    if (!anchor) throw fail('INVALID_CURSOR', 'The cursor is not a unit right under this one');
  }

  const rows = await client
    .select(nodeColumns(includeInactive))
    .from(orgUnits)
    .where(
      and(
        under,
        query.cursor
          ? gt(
              place,
              sql`(select ${orgUnits.sortOrder}, ${orgUnits.name}, ${orgUnits.id} from ${orgUnits} where ${orgUnits.id} = ${query.cursor})`,
            )
          : undefined,
      ),
    )
    .orderBy(...inPlace)
    .limit(query.limit + 1);

  const data = rows.slice(0, query.limit);

  return {
    data,
    nextCursor: rows.length > query.limit ? (data.at(-1)?.id ?? null) : null,
    totalCount: await client.$count(orgUnits, under),
  };
};

export const unitAncestors = async (
  client: Db,
  query: { id: string; includeInactive?: boolean },
) => {
  const ids = (await pathOf(client, query.id)).split('/').filter(Boolean).slice(0, -1);

  if (!ids.length) return [];

  return client
    .select(nodeColumns(query.includeInactive ?? false))
    .from(orgUnits)
    .where(inArray(orgUnits.id, ids))
    .orderBy(sql`length(${orgUnits.path})`);
};

export const unitsMatching = (client: Db, q: string) => {
  const nameStartsWithQuery = sql<boolean>`${orgUnits.name} ilike ${containsPattern(q).slice(1)}`;
  const depth = sql<number>`length(${orgUnits.path})`;

  return client
    .select({
      id: orgUnits.id,
      startsWith: nameStartsWithQuery.as('starts_with'),
      depth: depth.as('depth'),
      name: orgUnits.name,
    })
    .from(orgUnits)
    .where(
      and(
        matchEveryWord(q, (pattern) =>
          or(ilike(orgUnits.name, pattern), ilike(orgUnits.code, pattern)),
        ),
        // A search finds what the caller can pick: the units they reach, not the ones above.
        unitInReach(orgUnits),
      ),
    )
    .orderBy(desc(nameStartsWithQuery), asc(depth), asc(orgUnits.name))
    .limit(UNIT_MAX)
    .as('matched');
};

export const bestMatchFirst = (matched: ReturnType<typeof unitsMatching>) => [
  desc(matched.startsWith),
  asc(matched.depth),
  asc(matched.name),
];

export const searchUnits = (
  client: Db,
  query: { q: string; limit: number; includeInactive?: boolean },
) => {
  const includeInactive = query.includeInactive ?? false;
  const matched = unitsMatching(client, query.q);

  return client
    .select({
      ...nodeColumns(includeInactive),
      ancestorNames: sql<string[]>`coalesce((
        select array_agg(${above.name} order by step.depth)
        from ${pathSteps(orgUnits.path)}
        join ${orgUnits} ${above} on ${above.id} = step.id
        where ${ne(above.id, orgUnits.id)}
      ), '{}')`.as('ancestor_names'),
    })
    .from(matched)
    .innerJoin(orgUnits, eq(orgUnits.id, matched.id))
    .where(reachable(includeInactive))
    .orderBy(...bestMatchFirst(matched))
    .limit(query.limit);
};
