import { CONDITION_OPERATORS, type ConditionGroup, type ConditionRule } from '@erxes/core-contract';
import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const OPERATOR_LABELS: Record<(typeof CONDITION_OPERATORS)[number], string> = {
  eq: 'is',
  neq: 'is not',
  gt: 'is greater than',
  gte: 'is at least',
  lt: 'is less than',
  lte: 'is at most',
  contains: 'contains',
  not_contains: "doesn't contain",
  starts_with: 'starts with',
  in: 'is one of',
  not_in: 'is none of',
  exists: 'is set',
  not_exists: 'is empty',
};

/** Paths most conditions use; any other can be typed. */
export const COMMON_PATHS = [
  'subject.firstName',
  'subject.lastName',
  'subject.primaryEmail',
  'subject.primaryPhone',
  'subject.state',
  'subject.ownerId',
  'subject.tagIds',
  'subject.primaryName',
  'event.type',
  'event.actor.type',
  'event.payload',
];

const NO_VALUE = new Set(['exists', 'not_exists']);
const LIST_VALUE = new Set(['in', 'not_in']);

const isRule = (rule: ConditionRule | ConditionGroup): rule is ConditionRule => !('match' in rule);

/**
 * Conditions as rows: "<path> <operator> <value>", all or any of them.
 * (The engine also takes nested groups; they stay as they are here.)
 */
export const ConditionsEditor = ({
  value,
  onChange,
  disabled,
}: {
  value: ConditionGroup | undefined;
  onChange: (next: ConditionGroup | undefined) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const group: ConditionGroup = value ?? { match: 'all', rules: [] };
  const set = (rules: ConditionGroup['rules'], match = group.match) => onChange(rules.length ? { match, rules } : undefined);
  const update = (index: number, rule: ConditionRule) => set(group.rules.map((item, at) => (at === index ? rule : item)));

  return (
    <div className="space-y-2">
      {group.rules.length > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <span>{t('match-prefix', 'Match')}</span>
          <Select value={group.match} onValueChange={(match) => set(group.rules, match as 'all' | 'any')} disabled={disabled}>
            <Select.Trigger className="h-7 w-24">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">{t('match-all', 'all')}</Select.Item>
              <Select.Item value="any">{t('match-any', 'any')}</Select.Item>
            </Select.Content>
          </Select>
          <span>{t('match-suffix', 'of these')}</span>
        </div>
      )}
      {group.rules.map((rule, index) =>
        isRule(rule) ? (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <Input
              list="automation-paths"
              className="h-8 w-56 font-mono text-xs"
              value={rule.path}
              disabled={disabled}
              onChange={(event) => update(index, { ...rule, path: event.target.value })}
            />
            <Select value={rule.op} onValueChange={(op) => update(index, { ...rule, op: op as ConditionRule['op'] })} disabled={disabled}>
              <Select.Trigger className="h-8 w-44">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {CONDITION_OPERATORS.map((op) => (
                  <Select.Item key={op} value={op}>
                    {t(`op.${op}`, OPERATOR_LABELS[op])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {!NO_VALUE.has(rule.op) && (
              <Input
                className="h-8 w-56"
                disabled={disabled}
                placeholder={LIST_VALUE.has(rule.op) ? t('list-placeholder', 'a, b, c') : t('value-placeholder', 'value')}
                value={Array.isArray(rule.value) ? rule.value.join(', ') : String(rule.value ?? '')}
                onChange={(event) =>
                  update(index, {
                    ...rule,
                    value: LIST_VALUE.has(rule.op)
                      ? event.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                      : event.target.value,
                  })
                }
              />
            )}
            <Button size="sm" variant="ghost" disabled={disabled} onClick={() => set(group.rules.filter((_, at) => at !== index))}>
              <IconX />
            </Button>
          </div>
        ) : (
          <p key={index} className="text-xs text-muted-foreground">
            {t('nested-group', 'A nested group of {{count}} conditions', { count: rule.rules.length })}
          </p>
        ),
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => set([...group.rules, { path: 'subject.primaryEmail', op: 'exists' }])}
      >
        <IconPlus />
        {t('add-condition', 'Add condition')}
      </Button>
      <datalist id="automation-paths">
        {COMMON_PATHS.map((path) => (
          <option key={path} value={path} />
        ))}
      </datalist>
    </div>
  );
};
