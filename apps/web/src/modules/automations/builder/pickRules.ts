import type { ConditionGroup, ConditionRule } from '@erxes/core-contract';
import { z } from 'zod';

export type Picks = Record<string, string[]>;

type Item = ConditionGroup['rules'][number];

const Ids = z.array(z.string());

const isRule = (item: Item): item is ConditionRule => 'path' in item;

const idsOf = (item: Item, paths: Set<string>) =>
  isRule(item) && item.op === 'in' && paths.has(item.path)
    ? Ids.safeParse(item.value).data
    : undefined;

export const splitPicks = (
  group: ConditionGroup | undefined,
  paths: string[],
): { picks: Picks; rest: ConditionGroup | undefined } => {
  const wanted = new Set(paths);

  if (!group || group.match !== 'all' || wanted.size === 0) return { picks: {}, rest: group };

  const picks: Picks = {};
  const remaining: Item[] = [];

  for (const item of group.rules) {
    const ids = idsOf(item, wanted);

    if (ids && isRule(item)) picks[item.path] = ids;
    else remaining.push(item);
  }

  const [only] = remaining;

  if (remaining.length === 0) return { picks, rest: undefined };

  if (remaining.length === 1 && only && !isRule(only)) return { picks, rest: only };

  return { picks, rest: { match: 'all', rules: remaining } };
};

export const joinPicks = (
  picks: Picks,
  rest: ConditionGroup | undefined,
): ConditionGroup | undefined => {
  const chosen: Item[] = Object.entries(picks)
    .filter(([, ids]) => ids.length > 0)
    .map(([path, value]) => ({ path, op: 'in', value }));

  if (chosen.length === 0) return rest;

  const others = !rest?.rules.length ? [] : rest.match === 'all' ? rest.rules : [rest];

  return { match: 'all', rules: [...chosen, ...others] };
};
