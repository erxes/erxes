import type {
  DataExtensionCondition,
  DataExtensionField,
  DataExtensionRule,
} from '@erxes/core-contract';
import { rulesOf } from '@erxes/core-contract/dataExtensionConditions';
import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, Label, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConditionValue, isOperator, OPERATORS } from './ConditionValue';

type Match = 'all' | 'any';

/** At most this many rules in one condition, as the API takes. */
const RULES_MAX = 10;

/** Rules as the condition the API keeps: none, one rule, or several that all or any hold. */
const conditionOf = (
  rules: DataExtensionRule[],
  match: Match,
): DataExtensionCondition | undefined => {
  const [first] = rules;

  if (!first) return undefined;

  return rules.length === 1 ? first : { match, rules };
};

/** One rule: a field, how it compares, the value, and a button to remove it. */
const RuleRow = ({
  rule,
  fields,
  onChange,
  onRemove,
}: {
  rule: DataExtensionRule;
  /** The record type's other fields. */
  fields: DataExtensionField[];
  onChange: (rule: DataExtensionRule) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'conditions' });
  const field = fields.find((entry) => entry.key === rule.field);

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Select
        value={rule.field}
        onValueChange={(key) => onChange({ field: key, operator: rule.operator })}
      >
        <Select.Trigger variant="bordered" aria-label={t('field', 'Field')}>
          <Select.Value placeholder={t('field', 'Field')} />
        </Select.Trigger>
        <Select.Content>
          {fields.map((entry) => (
            <Select.Item key={entry.key} value={entry.key}>
              {entry.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Select
        value={rule.operator}
        onValueChange={(operator) =>
          isOperator(operator) && onChange({ field: rule.field, operator })
        }
      >
        <Select.Trigger variant="bordered" aria-label={t('operator', 'Compare')}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {Object.entries(OPERATORS).map(([operator, text]) => (
            <Select.Item key={operator} value={operator}>
              {t(`operators.${operator}`, text)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">
          <ConditionValue rule={rule} field={field} onChange={onChange} />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('remove-rule', 'Remove rule')}
          onClick={onRemove}
        >
          <IconX />
        </Button>
      </div>
    </div>
  );
};

/** Whether all the rules must hold, or any one: asked once there are two. */
const MatchSelect = ({ match, onChange }: { match: Match; onChange: (match: Match) => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'conditions' });

  return (
    <Select value={match} onValueChange={(next) => onChange(next === 'any' ? 'any' : 'all')}>
      <Select.Trigger variant="bordered" aria-label={t('match', 'Which rules')} className="w-56">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">{t('match-all', 'All of these rules')}</Select.Item>
        <Select.Item value="any">{t('match-any', 'Any one of these rules')}</Select.Item>
      </Select.Content>
    </Select>
  );
};

/**
 * "Show only while", "Hide while" or "Required while" other fields of the record type have a
 * value: rules to add, edit and remove, all or any of which must hold. None: always.
 */
export const ConditionEditor = ({
  label,
  condition,
  fields,
  onChange,
}: {
  label: string;
  condition: DataExtensionCondition | undefined;
  /** The record type's other fields. */
  fields: DataExtensionField[];
  onChange: (condition: DataExtensionCondition | undefined) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'conditions' });
  const rules = condition ? rulesOf(condition) : [];
  const match: Match = condition && 'match' in condition ? condition.match : 'all';
  const [first] = fields;
  // A rule has no id: each row keeps one while the sheet is open, so typing keeps its focus.
  const [ids, setIds] = useState(() => rules.map(() => crypto.randomUUID()));
  const idOf = (index: number) => ids[index] ?? `rule-${rules[index]?.field ?? ''}`;

  const setRules = (next: DataExtensionRule[]) => onChange(conditionOf(next, match));

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {rules.length > 1 && (
        <MatchSelect match={match} onChange={(next) => onChange(conditionOf(rules, next))} />
      )}
      {rules.map((rule, index) => (
        <RuleRow
          key={idOf(index)}
          rule={rule}
          fields={fields}
          onChange={(next) => setRules(rules.map((entry, at) => (at === index ? next : entry)))}
          onRemove={() => {
            setIds(ids.filter((_, at) => at !== index));
            setRules(rules.filter((_, at) => at !== index));
          }}
        />
      ))}
      {rules.length === 0 && (
        <p className="text-xs text-muted-foreground">{t('no-rules', 'No rules')}</p>
      )}
      {first && rules.length < RULES_MAX && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => {
            setIds([...ids, crypto.randomUUID()]);
            setRules([...rules, { field: first.key, operator: 'isNotEmpty' }]);
          }}
        >
          <IconPlus />
          {t('add-rule', 'Add rule')}
        </Button>
      )}
    </div>
  );
};
