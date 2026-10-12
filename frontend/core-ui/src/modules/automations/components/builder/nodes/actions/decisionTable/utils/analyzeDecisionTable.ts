import {
  DECISION_TABLE_ANY,
  matchesDecisionCell,
  parseNumberRanges,
  splitDecisionCell,
  TDecisionTableConfig,
  TDecisionTableInput,
} from './decisionTableCells';

// Past these sizes the check is skipped rather than freezing the builder
const MAX_ENUMERATED_RANGE = 500;
const MAX_COMBINATIONS = 20000;
const MAX_REPORTED_GAPS = 10;

export type TDecisionTableGap = {
  fixed: { key: string; value: string }[];
  key: string;
  values: string;
};

export type TDecisionTableAnalysis = {
  unreachableRows: { row: number; coveredBy: number }[];
  gaps: TDecisionTableGap[];
  gapsTruncated: boolean;
};

const cellOf = (when: Record<string, string>, key: string) =>
  (when[key] ?? DECISION_TABLE_ANY).trim();

const isInteger = (value: number) => Number.isInteger(value);

// Integer ranges that touch ([1-6] and [7-13]) leave no gap between them
const mergeRanges = (ranges: [number, number][]) =>
  [...ranges]
    .sort(([a], [b]) => a - b)
    .reduce<[number, number][]>((merged, [from, to]) => {
      const last = merged[merged.length - 1];
      const touches =
        last &&
        (from <= last[1] ||
          (isInteger(from) && isInteger(last[1]) && from === last[1] + 1));

      if (touches) {
        last[1] = Math.max(last[1], to);
      } else {
        merged.push([from, to]);
      }

      return merged;
    }, []);

const isCellCovered = (
  input: TDecisionTableInput,
  laterCell: string,
  earlierCell: string,
) => {
  if (earlierCell === DECISION_TABLE_ANY) {
    return true;
  }

  if (laterCell === DECISION_TABLE_ANY) {
    return false;
  }

  if (input.type === 'number') {
    const later = parseNumberRanges(laterCell);
    const earlier = parseNumberRanges(earlierCell);

    if (!later || !earlier) {
      return false;
    }

    const merged = mergeRanges(earlier);

    return later.every(([from, to]) =>
      merged.some(([start, end]) => from >= start && to <= end),
    );
  }

  const normalize = (cell: string) =>
    splitDecisionCell(cell).map((part) => part.toLowerCase());
  const earlier = new Set(normalize(earlierCell));

  return normalize(laterCell).every((part) => earlier.has(part));
};

const findUnreachableRows = (config: TDecisionTableConfig) =>
  config.rows.flatMap((row, laterIndex) => {
    const coveredBy = config.rows
      .slice(0, laterIndex)
      .findIndex((earlier) =>
        config.inputs.every((input) =>
          isCellCovered(
            input,
            cellOf(row.when, input.key),
            cellOf(earlier.when, input.key),
          ),
        ),
      );

    return coveredBy === -1
      ? []
      : [{ row: laterIndex + 1, coveredBy: coveredBy + 1 }];
  });

const getDomain = (input: TDecisionTableInput): string[] | null => {
  if (input.type === 'option') {
    return input.options.length ? input.options : null;
  }

  if (input.type === 'number' && input.range) {
    const [min, max] = input.range;

    if (
      !isInteger(min) ||
      !isInteger(max) ||
      max - min > MAX_ENUMERATED_RANGE
    ) {
      return null;
    }

    return Array.from({ length: max - min + 1 }, (_, index) =>
      String(min + index),
    );
  }

  return null;
};

const compressValues = (input: TDecisionTableInput, values: string[]) => {
  if (input.type !== 'number') {
    return values.join(', ');
  }

  const parts: string[] = [];
  const numbers = values.map(Number).sort((a, b) => a - b);

  for (let index = 0; index < numbers.length; index++) {
    const from = numbers[index];

    while (numbers[index + 1] === numbers[index] + 1) {
      index++;
    }

    parts.push(
      from === numbers[index] ? `${from}` : `${from}–${numbers[index]}`,
    );
  }

  return parts.join(', ');
};

/**
 * Only inputs with a known set of values (options, bounded integers) can be
 * checked. Other cells are taken to match, so every gap reported is certain.
 */
const findGaps = (config: TDecisionTableConfig) => {
  const enumerable = config.inputs
    .map((input) => ({ input, domain: getDomain(input) }))
    .filter(
      (entry): entry is { input: TDecisionTableInput; domain: string[] } =>
        !!entry.domain,
    );

  const combinations = enumerable.reduce(
    (total, { domain }) => total * domain.length,
    1,
  );

  if (!enumerable.length || combinations > MAX_COMBINATIONS) {
    return { gaps: [], gapsTruncated: false };
  }

  const isCovered = (combo: string[]) =>
    config.rows.some((row) =>
      enumerable.every(({ input }, index) =>
        matchesDecisionCell(input, cellOf(row.when, input.key), combo[index]),
      ),
    );

  const uncoveredByPrefix = new Map<
    string,
    { prefix: string[]; last: string[] }
  >();

  const walk = (combo: string[]) => {
    if (combo.length === enumerable.length) {
      if (!isCovered(combo)) {
        const prefix = combo.slice(0, -1);
        const key = prefix.join('\u0000');
        const group = uncoveredByPrefix.get(key) || { prefix, last: [] };

        group.last.push(combo[combo.length - 1]);
        uncoveredByPrefix.set(key, group);
      }

      return;
    }

    for (const value of enumerable[combo.length].domain) {
      walk([...combo, value]);
    }
  };

  walk([]);

  const lastInput = enumerable[enumerable.length - 1].input;
  const groups = [...uncoveredByPrefix.values()];

  return {
    gaps: groups.slice(0, MAX_REPORTED_GAPS).map(({ prefix, last }) => ({
      fixed: prefix.map((value, index) => ({
        key: enumerable[index].input.key,
        value,
      })),
      key: lastInput.key,
      values: compressValues(lastInput, last),
    })),
    gapsTruncated: groups.length > MAX_REPORTED_GAPS,
  };
};

export const analyzeDecisionTable = (
  config: TDecisionTableConfig,
): TDecisionTableAnalysis => ({
  unreachableRows: findUnreachableRows(config),
  ...findGaps(config),
});
