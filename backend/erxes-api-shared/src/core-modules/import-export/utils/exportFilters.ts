export type ExportFilterKind = 'date' | 'text';

export type ExportFilterRule = {
  field: string;
  operator: string;
  value?: string;
  from?: string;
  to?: string;
};

const DATE_OPERATORS = new Set(['lessThan', 'greaterThan', 'between']);
const TEXT_OPERATORS = new Set([
  'equals',
  'notEqual',
  'contains',
  'notContain',
  'isSet',
  'notSet',
]);

const parseIsoDate = (value: unknown): Date => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw new Error('Export date must be a valid ISO timestamp');
  }
  return new Date(value);
};

export const getExportFilterRules = (
  filters: Record<string, unknown> | undefined,
  supported: Record<string, ExportFilterKind>,
): ExportFilterRule[] => {
  const input = filters?.exportConditions;
  if (input === undefined) return [];
  if (!Array.isArray(input))
    throw new Error('Export conditions must be a list');

  const seen = new Set<string>();
  return input.map((candidate: unknown) => {
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      Array.isArray(candidate)
    ) {
      throw new Error('Invalid export condition');
    }
    const rule = candidate as Record<string, unknown>;
    if (
      typeof rule.field !== 'string' ||
      !supported[rule.field] ||
      seen.has(rule.field)
    ) {
      throw new Error('Unsupported or duplicate export filter field');
    }
    seen.add(rule.field);
    const kind = supported[rule.field];
    if (
      typeof rule.operator !== 'string' ||
      !(kind === 'date' ? DATE_OPERATORS : TEXT_OPERATORS).has(rule.operator)
    ) {
      throw new Error('Unsupported export filter operator');
    }
    if (kind === 'date') {
      const from =
        rule.from === undefined ? undefined : parseIsoDate(rule.from);
      const to = rule.to === undefined ? undefined : parseIsoDate(rule.to);
      if (
        (rule.operator === 'lessThan' && (!to || from)) ||
        (rule.operator === 'greaterThan' && (!from || to)) ||
        (rule.operator === 'between' && (!from || !to || from >= to))
      ) {
        throw new Error('Invalid export date range');
      }
    } else if (
      ['equals', 'notEqual', 'contains', 'notContain'].includes(
        rule.operator,
      ) &&
      (typeof rule.value !== 'string' || !rule.value.trim())
    ) {
      throw new Error('Export text value is required');
    }
    return rule as ExportFilterRule;
  });
};

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const exportRuleToMongoQuery = (
  rule: ExportFilterRule,
): Record<string, unknown> => {
  if (DATE_OPERATORS.has(rule.operator)) {
    return {
      [rule.field]: {
        ...(rule.from ? { $gte: new Date(rule.from) } : {}),
        ...(rule.to ? { $lt: new Date(rule.to) } : {}),
      },
    };
  }
  const populated = { $exists: true, $nin: [null, ''] };
  if (rule.operator === 'isSet') return { [rule.field]: populated };
  if (rule.operator === 'notSet') {
    return {
      $or: [
        { [rule.field]: { $exists: false } },
        { [rule.field]: null },
        { [rule.field]: '' },
      ],
    };
  }
  const regex = new RegExp(
    rule.operator === 'equals' || rule.operator === 'notEqual'
      ? `^${escapeRegex(rule.value || '')}$`
      : escapeRegex(rule.value || ''),
    'i',
  );
  if (rule.operator === 'notEqual' || rule.operator === 'notContain') {
    return { [rule.field]: { ...populated, $not: regex } };
  }
  return { [rule.field]: regex };
};

export const withExportFilters = (
  baseQuery: Record<string, unknown>,
  filters: Record<string, unknown> | undefined,
  supported: Record<string, ExportFilterKind>,
): Record<string, unknown> => {
  const rules = getExportFilterRules(filters, supported);
  return rules.length
    ? { $and: [baseQuery, ...rules.map(exportRuleToMongoQuery)] }
    : baseQuery;
};
