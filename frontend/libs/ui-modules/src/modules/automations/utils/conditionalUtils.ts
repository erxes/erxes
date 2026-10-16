import {
  TAutomationCondition,
  TAutomationConditional,
  TAutomationConditionalRow,
  TAutomationConditionals,
} from '../types/conditionalTypes';
import { generateAutomationElementId } from './automationUtils';

// Mirrors erxes-api-shared/core-modules/automations/conditionals.ts; the two
// test suites share their cases.

export const AUTOMATION_CONDITIONALS_KEY = '_conditionals';

const CONDITIONAL_TOKEN_REGEX = /^<<\s*cond:([A-Za-z0-9_-]+)\s*>>$/;

export const formatConditionalToken = (id: string) => `<< cond:${id} >>`;

export const parseConditionalToken = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const match = value.match(CONDITIONAL_TOKEN_REGEX);

  return match ? match[1] : null;
};

export const AUTOMATION_UNARY_OPERATORS = [
  'is',
  'ins',
  'dateis',
  'dateins',
  'it',
  'if',
];

export const AUTOMATION_CONDITION_OPERATORS = [
  { value: 'e', label: 'equals' },
  { value: 'dne', label: 'does not equal' },
  { value: 'c', label: 'contains' },
  { value: 'dnc', label: 'does not contain' },
  { value: 'numberigt', label: 'is at least' },
  { value: 'numberilt', label: 'is at most' },
  { value: 'is', label: 'is set' },
  { value: 'ins', label: 'is not set' },
];

const isEmptyValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && !value.length);

export const validateAutomationConditional = (
  conditional: TAutomationConditional,
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

  if (conditional.required) {
    for (const key of conditional.keys) {
      if (isEmptyValue(conditional.otherwise?.[key])) {
        errors.push('Otherwise: set a value');
        break;
      }
    }
  }

  return errors;
};

export const createEmptyCondition = (): TAutomationCondition => ({
  kind: 'value',
  left: '',
  operator: 'e',
  right: '',
});

export const createEmptyConditionalRow = (
  takenIds: string[] = [],
): TAutomationConditionalRow => ({
  id: generateAutomationElementId(takenIds),
  conjunction: 'and',
  conditions: [createEmptyCondition()],
  values: {},
});

/** Ids of every conditional a config still points at, at any depth. */
export const collectConditionalTokenIds = (node: unknown): string[] => {
  const id = parseConditionalToken(node);

  if (id) {
    return [id];
  }

  if (Array.isArray(node)) {
    return node.flatMap(collectConditionalTokenIds);
  }

  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) =>
      key === AUTOMATION_CONDITIONALS_KEY
        ? []
        : collectConditionalTokenIds(value),
    );
  }

  return [];
};

/**
 * Checks the conditionals a config references and keeps only those, so rules
 * whose field was removed or switched back to a plain value do not linger.
 */
export const finalizeAutomationConditionals = (
  config: Record<string, unknown>,
  draft: TAutomationConditionals,
) => {
  const referencedIds = [...new Set(collectConditionalTokenIds(config))];
  const errors: Record<string, string[]> = {};
  const kept: TAutomationConditionals = {};

  for (const id of referencedIds) {
    const conditional = draft[id];

    if (!conditional) {
      errors[id] = ['This value lost its conditions; set it again'];
      continue;
    }

    const conditionalErrors = validateAutomationConditional(conditional);

    if (conditionalErrors.length) {
      errors[id] = conditionalErrors;
    }

    kept[id] = conditional;
  }

  return { conditionals: kept, errors };
};

export const getPathParent = (path: string) =>
  path.split('.').slice(0, -1).join('.');

export const getPathKey = (path: string) => path.split('.').pop() || path;

// `{{ actions.<id>.attributes.priority }}` reads as `attributes.priority`
const readableOperand = (value?: string) =>
  (value || '')
    .replace(
      /\{\{\s*(?:trigger|input|actions\.[^.\s]+)\.([^}]+?)\s*\}\}/g,
      '$1',
    )
    .replace(/\[\[\s*([^\]]+?)\s*\]\]/g, '$1');

const describeCondition = (condition: TAutomationCondition) => {
  if (condition.kind === 'segment') {
    return condition.segmentId ? 'in segment' : 'segment not picked';
  }

  const operator =
    AUTOMATION_CONDITION_OPERATORS.find(
      ({ value }) => value === condition.operator,
    )?.label || condition.operator;

  return [
    readableOperand(condition.left) || '…',
    operator,
    readableOperand(condition.right),
  ]
    .filter(Boolean)
    .join(' ');
};

export const describeConditionalRow = (row: TAutomationConditionalRow) =>
  row.conditions.length
    ? row.conditions
        .map(describeCondition)
        .join(row.conjunction === 'or' ? ' OR ' : ' AND ')
    : 'No conditions yet';
