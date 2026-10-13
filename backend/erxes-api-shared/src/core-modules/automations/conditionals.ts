import { IAutomationExecution } from './definitions/executions';
import { replaceOutputPlaceholders } from './outputResolvers';

/**
 * A field whose value depends on the run holds a token instead of a value;
 * the rules behind it live in the action config under this key. The engine
 * swaps tokens for the first matching row before the action ever sees its
 * config, so no action has to know conditionals exist.
 */
export const AUTOMATION_CONDITIONALS_KEY = '_conditionals';

const CONDITIONAL_TOKEN_REGEX = /^<<\s*cond:([A-Za-z0-9_-]+)\s*>>$/;

export const formatConditionalToken = (id: string) => `<< cond:${id} >>`;

// The whole value must be the token, so text that merely mentions one is left alone
export const parseConditionalToken = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const match = value.match(CONDITIONAL_TOKEN_REGEX);

  return match ? match[1] : null;
};

export type TAutomationValueCondition = {
  kind: 'value';
  left: string;
  operator: string;
  right?: string;
  meta?: Record<string, unknown>;
};

export type TAutomationSegmentCondition = {
  kind: 'segment';
  segmentId: string;
};

export type TAutomationCondition =
  | TAutomationValueCondition
  | TAutomationSegmentCondition;

export type TAutomationConditionalRow = {
  id: string;
  conjunction?: 'and' | 'or';
  conditions: TAutomationCondition[];
  values: Record<string, unknown>;
};

export type TAutomationConditional = {
  keys: string[];
  label?: string;
  rows: TAutomationConditionalRow[];
  otherwise: Record<string, unknown>;
};

export type TAutomationConditionals = Record<string, TAutomationConditional>;

// Operators that test presence or truth and take no right-hand value
export const AUTOMATION_UNARY_OPERATORS = [
  'is',
  'ins',
  'dateis',
  'dateins',
  'it',
  'if',
];

const isEmptyValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && !value.length);

const normalizeDate = (value: unknown) => {
  const date =
    value instanceof Date ? value : new Date(value as string | number);

  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const compareDates = (
  actual: unknown,
  expected: unknown,
  compare: (a: number, b: number) => boolean,
) => {
  const actualDate = normalizeDate(actual);
  const expectedDate = normalizeDate(expected);

  return actualDate !== null && expectedDate !== null
    ? compare(actualDate, expectedDate)
    : false;
};

/** Split and conditional values share one meaning per operator. */
export const isAutomationConditionMatched = (
  actualValue: unknown,
  operator: string | undefined,
  expectedValue: unknown,
) => {
  switch (operator) {
    case 'e':
      return actualValue === expectedValue;

    case 'numbere':
      return Number(actualValue) === Number(expectedValue);

    case 'dne':
      return actualValue !== expectedValue;

    case 'numberdne':
      return Number(actualValue) !== Number(expectedValue);

    case 'c':
      return String(actualValue || '')
        .toLowerCase()
        .includes(String(expectedValue || '').toLowerCase());

    case 'dnc':
      return !String(actualValue || '')
        .toLowerCase()
        .includes(String(expectedValue || '').toLowerCase());

    case 'it':
      return actualValue === true;

    case 'if':
      return actualValue === false;

    case 'is':
    case 'dateis':
      return !isEmptyValue(actualValue);

    case 'ins':
    case 'dateins':
      return isEmptyValue(actualValue);

    case 'numberigt':
      return Number(actualValue) >= Number(expectedValue);

    case 'numberilt':
      return Number(actualValue) <= Number(expectedValue);

    case 'dateigt':
      return compareDates(actualValue, expectedValue, (a, b) => a >= b);

    case 'dateilt':
      return compareDates(actualValue, expectedValue, (a, b) => a <= b);

    default:
      return false;
  }
};

/** Problems that keep a conditional from running; empty when it can. */
export const validateAutomationConditional = (
  conditional: TAutomationConditional,
  { requiredKeys = [] }: { requiredKeys?: string[] } = {},
) => {
  const errors: string[] = [];

  if (!conditional.rows.length) {
    errors.push('Add at least one condition row');
  }

  conditional.rows.forEach((row, rowIndex) => {
    const at = `Row ${rowIndex + 1}`;

    if (!row.conditions.length) {
      errors.push(`${at}: add at least one condition`);
    }

    row.conditions.forEach((condition, conditionIndex) => {
      const where = `${at}, condition ${conditionIndex + 1}`;

      if (condition.kind === 'segment') {
        if (!condition.segmentId) {
          errors.push(`${where}: pick a segment`);
        }

        return;
      }

      if (!condition.left?.trim()) {
        errors.push(`${where}: pick a value to check`);
      }

      if (!condition.operator) {
        errors.push(`${where}: pick an operator`);
      } else if (
        !AUTOMATION_UNARY_OPERATORS.includes(condition.operator) &&
        isEmptyValue(condition.right)
      ) {
        errors.push(`${where}: enter a value to compare with`);
      }
    });

    for (const key of conditional.keys) {
      if (isEmptyValue(row.values?.[key])) {
        errors.push(`${at}: set a value`);
        break;
      }
    }
  });

  for (const key of requiredKeys) {
    if (isEmptyValue(conditional.otherwise?.[key])) {
      errors.push('Otherwise: set a value');
      break;
    }
  }

  return errors;
};

const conditionCacheKey = (condition: TAutomationCondition) =>
  condition.kind === 'segment'
    ? `segment|${condition.segmentId}`
    : `value|${condition.left}|${condition.operator}|${condition.right ?? ''}`;

type TConditionEvaluator = (
  condition: TAutomationCondition,
) => Promise<boolean>;

// One answer per distinct condition for the whole action, however many
// fields repeat it
const createConditionEvaluator = ({
  subdomain,
  execution,
  isInSegment,
}: {
  subdomain: string;
  execution: IAutomationExecution;
  isInSegment: (segmentId: string) => Promise<boolean>;
}): TConditionEvaluator => {
  const answers = new Map<string, Promise<boolean>>();

  const evaluate = async (condition: TAutomationCondition) => {
    if (condition.kind === 'segment') {
      return isInSegment(condition.segmentId);
    }

    const resolved = await replaceOutputPlaceholders({
      subdomain,
      execution,
      values: { left: condition.left, right: condition.right ?? '' },
      defaultValue: '',
      keepUnresolvedPlaceholders: false,
    });

    return isAutomationConditionMatched(
      resolved.left,
      condition.operator,
      resolved.right,
    );
  };

  return (condition) => {
    const key = conditionCacheKey(condition);

    if (!answers.has(key)) {
      answers.set(key, evaluate(condition));
    }

    return answers.get(key) as Promise<boolean>;
  };
};

const isRowMatched = async (
  row: TAutomationConditionalRow,
  evaluate: TConditionEvaluator,
) => {
  if (!row.conditions.length) {
    return false;
  }

  if (row.conjunction === 'or') {
    for (const condition of row.conditions) {
      if (await evaluate(condition)) {
        return true;
      }
    }

    return false;
  }

  for (const condition of row.conditions) {
    if (!(await evaluate(condition))) {
      return false;
    }
  }

  return true;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Returns the config the action should run with: every token replaced by its
 * first matching row (or otherwise), the conditionals key removed, and which
 * row each conditional used. Tokens without a conditional are reported, never
 * passed through as text.
 */
export const applyAutomationConditionals = async ({
  subdomain,
  execution,
  config,
  isInSegment,
}: {
  subdomain: string;
  execution: IAutomationExecution;
  config: Record<string, unknown> | undefined;
  isInSegment: (segmentId: string) => Promise<boolean>;
}) => {
  const { [AUTOMATION_CONDITIONALS_KEY]: rawConditionals, ...rest } =
    config || {};
  const conditionals = (
    isRecord(rawConditionals) ? rawConditionals : {}
  ) as TAutomationConditionals;

  const evaluate = createConditionEvaluator({
    subdomain,
    execution,
    isInSegment,
  });
  const matches: Record<string, string> = {};
  const missing: string[] = [];
  const chosenById = new Map<string, Record<string, unknown>>();

  const choose = async (id: string, conditional: TAutomationConditional) => {
    if (!chosenById.has(id)) {
      let chosen: { rowId: string; values: Record<string, unknown> } = {
        rowId: 'otherwise',
        values: conditional.otherwise || {},
      };

      for (const row of conditional.rows || []) {
        if (await isRowMatched(row, evaluate)) {
          chosen = { rowId: row.id, values: row.values || {} };
          break;
        }
      }

      matches[id] = chosen.rowId;
      chosenById.set(id, {
        ...(conditional.otherwise || {}),
        ...chosen.values,
      });
    }

    return chosenById.get(id) as Record<string, unknown>;
  };

  const walk = async (node: unknown): Promise<unknown> => {
    if (Array.isArray(node)) {
      return Promise.all(node.map(walk));
    }

    if (!isRecord(node)) {
      return node;
    }

    const next: Record<string, unknown> = {};
    const patches: Record<string, unknown>[] = [];

    for (const [key, value] of Object.entries(node)) {
      const id = parseConditionalToken(value);

      if (!id) {
        next[key] = await walk(value);
        continue;
      }

      const conditional = conditionals[id];

      if (!conditional) {
        missing.push(id);
        next[key] = '';
        continue;
      }

      const chosen = await choose(id, conditional);
      const keys = conditional.keys?.length ? conditional.keys : [key];

      patches.push(
        Object.fromEntries(
          keys.map((patchKey) => [patchKey, chosen[patchKey]]),
        ),
      );
    }

    // Siblings a conditional owns are overwritten after the plain values
    return Object.assign(next, ...patches);
  };

  return {
    config: (await walk(rest)) as Record<string, unknown>,
    matches,
    missing,
  };
};
