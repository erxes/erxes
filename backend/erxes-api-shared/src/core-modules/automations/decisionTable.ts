import { z } from 'zod';

/**
 * A decision table picks values, not branches: rows are tried top to bottom
 * and the first row whose every cell matches supplies the outputs. Cells hold
 * only literals, lists and ranges, so a table can be checked for gaps and
 * unreachable rows — a free expression could not be.
 */
export const DECISION_TABLE_ANY = '*';

export const DECISION_TABLE_INPUT_TYPES = [
  'text',
  'number',
  'option',
  'segment',
] as const;

export const DECISION_TABLE_OUTPUT_TYPES = ['text', 'number', 'user'] as const;

const decisionTableInputSchema = z.object({
  key: z.string().min(1),
  type: z.enum(DECISION_TABLE_INPUT_TYPES),
  // Placeholder expression; a segment column tests the execution target
  value: z.string().optional().default(''),
  options: z.array(z.string()).optional().default([]),
  range: z.tuple([z.number(), z.number()]).optional(),
});

const decisionTableOutputSchema = z.object({
  key: z.string().min(1),
  type: z.enum(DECISION_TABLE_OUTPUT_TYPES),
});

const decisionTableRowSchema = z.object({
  id: z.string().min(1),
  when: z.record(z.string()).default({}),
  then: z.record(z.string()).default({}),
});

export const decisionTableConfigSchema = z.object({
  inputs: z.array(decisionTableInputSchema).min(1),
  outputs: z.array(decisionTableOutputSchema).min(1),
  rows: z.array(decisionTableRowSchema).default([]),
  noMatch: z.discriminatedUnion('mode', [
    z.object({ mode: z.literal('default'), then: z.record(z.string()) }),
    z.object({ mode: z.literal('fail') }),
  ]),
});

export type TDecisionTableInput = z.infer<typeof decisionTableInputSchema>;
export type TDecisionTableOutput = z.infer<typeof decisionTableOutputSchema>;
export type TDecisionTableRow = z.infer<typeof decisionTableRowSchema>;
export type TDecisionTableConfig = z.infer<typeof decisionTableConfigSchema>;

const splitCell = (cell: string) =>
  cell
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const normalizeText = (value: unknown) => String(value).trim().toLowerCase();

const parseNumberRanges = (cell: string): [number, number][] | null => {
  const ranges: [number, number][] = [];

  for (const part of splitCell(cell)) {
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

/** Why a cell cannot be read, or null when it is valid. */
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
    const unknown = splitCell(trimmed).find(
      (part) => !known.has(normalizeText(part)),
    );

    if (unknown) {
      return `"${input.key}": "${unknown}" is not one of its options`;
    }
  }

  return null;
};

/** Problems that make the table unusable; empty when it can run. */
export const validateDecisionTableConfig = (config: TDecisionTableConfig) => {
  const errors: string[] = [];
  const inputKeys = new Set(config.inputs.map(({ key }) => key));
  const outputKeys = new Set(config.outputs.map(({ key }) => key));

  if (inputKeys.size !== config.inputs.length) {
    errors.push('Input keys must be unique');
  }

  if (outputKeys.size !== config.outputs.length) {
    errors.push('Output keys must be unique');
  }

  config.rows.forEach((row, index) => {
    for (const input of config.inputs) {
      const error = getDecisionCellError(
        input,
        row.when[input.key] ?? DECISION_TABLE_ANY,
      );

      if (error) {
        errors.push(`Row ${index + 1}: ${error}`);
      }
    }

    for (const key of Object.keys(row.when)) {
      if (!inputKeys.has(key)) {
        errors.push(`Row ${index + 1}: unknown input "${key}"`);
      }
    }

    for (const key of Object.keys(row.then)) {
      if (!outputKeys.has(key)) {
        errors.push(`Row ${index + 1}: unknown output "${key}"`);
      }
    }
  });

  return errors;
};

/**
 * Value cells only; a segment cell needs the execution target and is decided
 * by the caller. An empty value never matches, not even "*" — a complaint
 * without a ward must not land on a row that ignores the ward.
 */
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

  const accepted = new Set(splitCell(trimmed).map(normalizeText));

  return values.some((item) => accepted.has(normalizeText(item)));
};

export type TDecisionTableMatch = {
  rowIndex: number;
  row: TDecisionTableRow;
};

/**
 * Segment cells are checked last within a row, so a row already ruled out by
 * its value cells costs no segment lookup.
 */
export const findDecisionTableRow = async ({
  config,
  values,
  isInSegment,
}: {
  config: TDecisionTableConfig;
  values: Record<string, unknown>;
  isInSegment: (segmentId: string) => Promise<boolean>;
}): Promise<TDecisionTableMatch | null> => {
  const valueInputs = config.inputs.filter(({ type }) => type !== 'segment');
  const segmentInputs = config.inputs.filter(({ type }) => type === 'segment');

  for (const [rowIndex, row] of config.rows.entries()) {
    const cellOf = (key: string) => row.when[key] ?? DECISION_TABLE_ANY;

    const valuesMatch = valueInputs.every((input) =>
      matchesDecisionCell(input, cellOf(input.key), values[input.key]),
    );

    if (!valuesMatch) {
      continue;
    }

    let segmentsMatch = true;

    for (const input of segmentInputs) {
      const cell = cellOf(input.key).trim();

      if (cell === DECISION_TABLE_ANY) {
        continue;
      }

      let inAny = false;

      for (const segmentId of splitCell(cell)) {
        if (await isInSegment(segmentId)) {
          inAny = true;
          break;
        }
      }

      if (!inAny) {
        segmentsMatch = false;
        break;
      }
    }

    if (segmentsMatch) {
      return { rowIndex, row };
    }
  }

  return null;
};
