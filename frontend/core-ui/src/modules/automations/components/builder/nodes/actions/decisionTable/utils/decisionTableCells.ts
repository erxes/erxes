// Mirrors erxes-api-shared/core-modules/automations/decisionTable.ts so the
// builder can test and check a table without a round trip; the two suites
// share the same cases.

export const DECISION_TABLE_ANY = '*';

export const DECISION_TABLE_INPUT_TYPES = [
  'text',
  'number',
  'option',
  'segment',
] as const;

export const DECISION_TABLE_OUTPUT_TYPES = ['text', 'number', 'user'] as const;

export type TDecisionTableInputType =
  (typeof DECISION_TABLE_INPUT_TYPES)[number];
export type TDecisionTableOutputType =
  (typeof DECISION_TABLE_OUTPUT_TYPES)[number];

export type TDecisionTableInput = {
  key: string;
  type: TDecisionTableInputType;
  value: string;
  options: string[];
  range?: [number, number];
};

export type TDecisionTableOutput = {
  key: string;
  type: TDecisionTableOutputType;
};

export type TDecisionTableRow = {
  id: string;
  when: Record<string, string>;
  then: Record<string, string>;
};

export type TDecisionTableConfig = {
  inputs: TDecisionTableInput[];
  outputs: TDecisionTableOutput[];
  rows: TDecisionTableRow[];
  noMatch: { mode: 'default'; then: Record<string, string> } | { mode: 'fail' };
};

export const splitDecisionCell = (cell: string) =>
  cell
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const normalizeText = (value: unknown) => String(value).trim().toLowerCase();

export const parseNumberRanges = (cell: string): [number, number][] | null => {
  const ranges: [number, number][] = [];

  for (const part of splitDecisionCell(cell)) {
    const bounds = part.split('-').map((bound) => bound.trim());

    if (bounds.length > 2 || bounds.some((bound) => bound === '')) {
      return null;
    }

    const [from, to = from] = bounds.map(Number);

    if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
      return null;
    }

    ranges.push([from, to]);
  }

  return ranges.length ? ranges : null;
};

export const isEmptyDecisionValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && !value.length);

export const getDecisionCellError = (
  input: TDecisionTableInput,
  cell: string,
): string | null => {
  const trimmed = cell.trim();

  if (!trimmed) {
    return `"${input.key}" is empty; use ${DECISION_TABLE_ANY} for any value`;
  }

  if (trimmed === DECISION_TABLE_ANY) {
    return null;
  }

  if (input.type === 'number') {
    const ranges = parseNumberRanges(trimmed);

    if (!ranges) {
      return `"${input.key}": "${trimmed}" is not a number, list or range`;
    }

    if (input.range) {
      const [min, max] = input.range;
      const outside = ranges.find(([from, to]) => from < min || to > max);

      if (outside) {
        return `"${input.key}": ${outside.join('-')} is outside ${min}-${max}`;
      }
    }

    return null;
  }

  if (input.type === 'option' && input.options.length) {
    const known = new Set(input.options.map(normalizeText));
    const unknown = splitDecisionCell(trimmed).find(
      (part) => !known.has(normalizeText(part)),
    );

    if (unknown) {
      return `"${input.key}": "${unknown}" is not one of its options`;
    }
  }

  return null;
};

export const matchesDecisionCell = (
  input: TDecisionTableInput,
  cell: string,
  value: unknown,
) => {
  if (isEmptyDecisionValue(value)) {
    return false;
  }

  const trimmed = cell.trim();

  if (trimmed === DECISION_TABLE_ANY) {
    return true;
  }

  const values = Array.isArray(value) ? value : [value];

  if (input.type === 'number') {
    const ranges = parseNumberRanges(trimmed) || [];

    return values.some((item) => {
      const number = Number(item);

      return (
        Number.isFinite(number) &&
        ranges.some(([from, to]) => number >= from && number <= to)
      );
    });
  }

  const accepted = new Set(splitDecisionCell(trimmed).map(normalizeText));

  return values.some((item) => accepted.has(normalizeText(item)));
};

/** Synchronous twin of findDecisionTableRow; segments come as a member set. */
export const findDecisionTableRowIndex = (
  config: TDecisionTableConfig,
  values: Record<string, unknown>,
  memberOfSegmentIds: Set<string>,
) =>
  config.rows.findIndex((row) =>
    config.inputs.every((input) => {
      const cell = (row.when[input.key] ?? DECISION_TABLE_ANY).trim();

      if (input.type !== 'segment') {
        return matchesDecisionCell(input, cell, values[input.key]);
      }

      return (
        cell === DECISION_TABLE_ANY ||
        splitDecisionCell(cell).some((id) => memberOfSegmentIds.has(id))
      );
    }),
  );
