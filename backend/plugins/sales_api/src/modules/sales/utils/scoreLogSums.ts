import { sendTRPCMessage } from 'erxes-api-shared/utils';

// What loyalty sums in one call.
const TOTALS_BATCH = 1000;
const TOP_SOURCES = 10;

export type TLoyaltyTotal = {
  targetId: string;
  ownerId: string;
  action: string;
  // A recalculation's reversal or replacement: the action it recalculates.
  recalculates?: string | null;
  total: number;
  count: number;
};

type TKindTotals = {
  earned: number;
  spent: number;
  refunded: number;
  other: number;
  // What recalculated purchases changed on earnings and spendings, apart
  // from what was first given or taken.
  recalculatedEarned: number;
  recalculatedSpent: number;
  net: number;
};

type TKind = keyof Omit<TKindTotals, 'net'>;

// Kinds a source reads; expiry and resets fall under `other`, so the kinds
// always add up to the net.
export const kindOf = (action: string): TKind => {
  switch (action) {
    case 'add':
      return 'earned';
    case 'subtract':
      return 'spent';
    case 'refund':
    case 'return':
      return 'refunded';
    default:
      return 'other';
  }
};

// A recalculation's entries go apart from the action they recalculate.
export const kindOfRow = ({
  action,
  recalculates,
}: {
  action: string;
  recalculates?: string | null;
}): TKind => {
  if (recalculates === 'add') {
    return 'recalculatedEarned';
  }

  return recalculates === 'subtract' ? 'recalculatedSpent' : kindOf(action);
};

export const round = (value: number) => Number(value.toFixed(2));

export type TKinds = TKindTotals;

export const emptyKinds = (): TKinds => ({
  earned: 0,
  spent: 0,
  refunded: 0,
  other: 0,
  recalculatedEarned: 0,
  recalculatedSpent: 0,
  net: 0,
});

const addKind = (
  groups: Map<string, TKinds>,
  key: string,
  kind: TKind,
  total: number,
) => {
  const line = groups.get(key) || emptyKinds();

  line[kind] += total;
  line.net += total;
  groups.set(key, line);
};

// What a group earns or spends now, recalculations included.
const standing = (line: TKinds) => ({
  earned: line.earned + line.recalculatedEarned,
  spent: line.spent + line.recalculatedSpent,
});

// The ten largest by what they earn or spend now (spending is negative, so
// by its size).
const ranked = (groups: Map<string, TKinds>, kind: 'earned' | 'spent') =>
  [...groups.entries()]
    .map(([id, line]) => ({ id, line, now: standing(line) }))
    .filter(({ id, now }) => id && now[kind] !== 0)
    .sort((a, b) => Math.abs(b.now[kind]) - Math.abs(a.now[kind]))
    .slice(0, TOP_SOURCES)
    .map(({ id, line, now }) => ({
      id,
      earned: round(now.earned),
      spent: round(now.spent),
      refunded: round(line.refunded),
      net: round(line.net),
    }));

// One of a page's sums opened to its entries: a kind, a period of the
// timeline, or both; loyalty decides which entries match.
export type TScoreLogDrill = {
  kind?: string | null;
  period?: { interval: string; timezone: string; key: string } | null;
};

/** The entries behind a kind or period, or null when nothing is drilled. */
export const drilledIds = async (
  subdomain: string,
  ids: string[],
  { kind, period }: TScoreLogDrill,
) => {
  if (!kind && !period) {
    return null;
  }

  const matched: string[] = [];

  for (let i = 0; i < ids.length; i += TOTALS_BATCH) {
    const part: string[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      method: 'query',
      module: 'score',
      action: 'filterIds',
      input: {
        ids: ids.slice(i, i + TOTALS_BATCH),
        ...(kind ? { kind } : {}),
        ...(period ? { period } : {}),
      },
      throwOnError: true,
    });

    matched.push(...(part || []));
  }

  return matched;
};

/** Loyalty's sums for these entries, asked in batches it accepts. */
export const loyaltyTotals = async (subdomain: string, ids: string[]) => {
  const rows: TLoyaltyTotal[] = [];

  for (let i = 0; i < ids.length; i += TOTALS_BATCH) {
    const part: TLoyaltyTotal[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      method: 'query',
      module: 'score',
      action: 'totalsByIds',
      input: { ids: ids.slice(i, i + TOTALS_BATCH) },
      throwOnError: true,
    });

    rows.push(...(part || []));
  }

  return rows;
};

/** A record that caused loyalty entries, with the fields its sums group by. */
export type TScoreLogSource = {
  id: string;
  name?: string;
  // Where it belongs: a deal's pipeline (on its board), an order's POS.
  group?: {
    id?: string;
    name?: string;
    parentId?: string;
    parentName?: string;
  };
  // Who made it: a deal's assignees, an order's cashier.
  peopleIds?: string[];
  branchIds?: string[];
};

/**
 * Groups loyalty's sums by the sources' own fields; nothing is kept. A
 * source with several people or branches counts in full for each.
 */
export const sumScoreLogs = (
  sources: TScoreLogSource[],
  rows: TLoyaltyTotal[],
) => {
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const byAction = new Map<string, { total: number; count: number }>();
  const recalculated = { earned: 0, spent: 0 };
  const byGroup = new Map<string, TKinds>();
  const bySource = new Map<string, TKinds>();
  const byPeople = new Map<string, TKinds>();
  const byBranch = new Map<string, TKinds>();
  const byCustomer = new Map<string, TKinds>();
  const ownerIds = new Set<string>();

  for (const row of rows) {
    const { targetId, ownerId, action, total, count } = row;
    // A recalculated purchase is neither a refund nor a new earning: its
    // entries count apart, so the kinds still add up to the net.
    const kind = kindOfRow(row);

    if (kind === 'recalculatedEarned') {
      recalculated.earned += total;
    } else if (kind === 'recalculatedSpent') {
      recalculated.spent += total;
    } else {
      const sum = byAction.get(action) || { total: 0, count: 0 };
      byAction.set(action, {
        total: sum.total + total,
        count: sum.count + count,
      });
    }

    const source = sourceById.get(targetId);

    addKind(byGroup, source?.group?.id || '', kind, total);
    addKind(bySource, targetId, kind, total);

    if (ownerId) {
      ownerIds.add(ownerId);
      addKind(byCustomer, ownerId, kind, total);
    }

    (source?.peopleIds || []).forEach((id) =>
      addKind(byPeople, id, kind, total),
    );
    (source?.branchIds || []).forEach((id) =>
      addKind(byBranch, id, kind, total),
    );
  }

  const totals = [...byAction.entries()].map(([action, { total, count }]) => ({
    action,
    total: round(total),
    count,
  }));
  const groupOf = (groupId: string) =>
    sources.find(({ group }) => (group?.id || '') === groupId)?.group;

  return {
    totals,
    // Every entry counted, recalculations included: the page's count.
    entryCount: rows.reduce((acc, { count }) => acc + count, 0),
    recalculatedEarned: round(recalculated.earned),
    recalculatedSpent: round(recalculated.spent),
    net: round(
      totals.reduce((acc, { total }) => acc + total, 0) +
        recalculated.earned +
        recalculated.spent,
    ),
    sourceCount: bySource.size,
    customerCount: ownerIds.size,
    // Ranked by what each source earns now.
    topSources: [...bySource.entries()]
      .map(([id, line]) => ({ id, line, earned: standing(line).earned }))
      .filter(({ earned }) => earned > 0)
      .sort((a, b) => b.earned - a.earned)
      .slice(0, TOP_SOURCES)
      .map(({ id, line, earned }) => ({
        id,
        name: sourceById.get(id)?.name,
        groupName: sourceById.get(id)?.group?.name,
        earned: round(earned),
        net: round(line.net),
      })),
    byPeople: ranked(byPeople, 'earned'),
    byBranch: ranked(byBranch, 'earned'),
    topEarners: ranked(byCustomer, 'earned'),
    topSpenders: ranked(byCustomer, 'spent'),
    byGroup: [...byGroup.entries()]
      .map(([groupId, line]) => {
        const group = groupOf(groupId);

        return {
          id: group?.id,
          name: group?.name,
          parentId: group?.parentId,
          parentName: group?.parentName,
          earned: round(line.earned),
          spent: round(line.spent),
          refunded: round(line.refunded),
          other: round(line.other),
          recalculated: round(line.recalculatedEarned + line.recalculatedSpent),
          net: round(line.net),
        };
      })
      .sort((a, b) => b.earned - a.earned),
  };
};
