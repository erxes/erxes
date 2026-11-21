import type {
  DataExtensionCondition,
  DataExtensionField,
  DataExtensionRule,
} from '@erxes/core-contract';
import { IconX } from '@tabler/icons-react';
import { Button, Input, Label, MultipleSelector, Select, StringArrayInput } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { numberOf, stringsOf, textOfValue } from '../../form/inputProps';

type Condition = DataExtensionRule;

const OPERATORS = {
  eq: 'is',
  neq: 'is not',
  in: 'is one of',
  isNotEmpty: 'has a value',
  isEmpty: 'is empty',
  contains: 'contains',
  greaterThan: 'is more than',
  lessThan: 'is less than',
} satisfies Record<Condition['operator'], string>;

/** Operators that compare with no value. */
const NO_VALUE: ReadonlySet<string> = new Set(['isNotEmpty', 'isEmpty']);

const isOperator = (value: string): value is Condition['operator'] =>
  Object.hasOwn(OPERATORS, value);

/** The value a condition compares with, typed as its field's values are. */
const ConditionValue = ({
  condition,
  field,
  onChange,
}: {
  condition: Condition;
  field: DataExtensionField | undefined;
  onChange: (condition: Condition) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'conditions' });

  const options = (field?.options ?? []).map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const set = (value: Condition['value']) => onChange({ ...condition, value });
  const label = t('value', 'Value');

  if (NO_VALUE.has(condition.operator)) return null;

  if (condition.operator === 'in') {
    const picked = stringsOf(condition.value);

    return options.length ? (
      <MultipleSelector
        options={options}
        value={options.filter((option) => picked.includes(option.value))}
        onChange={(next) => set(next.map((option) => option.value))}
      />
    ) : (
      <StringArrayInput value={picked} onValueChange={set} placeholder={label} />
    );
  }

  if (options.length || field?.type === 'boolean') {
    const choices = options.length
      ? options
      : [
          { value: 'true', label: t('yes', 'Yes') },
          { value: 'false', label: t('no', 'No') },
        ];

    return (
      <Select
        value={
          typeof condition.value === 'boolean'
            ? String(condition.value)
            : textOfValue(condition.value)
        }
        onValueChange={(next) => set(field?.type === 'boolean' ? next === 'true' : next)}
      >
        <Select.Trigger variant="bordered" aria-label={label}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {choices.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  const numeric = field?.type === 'number' || field?.type === 'percent' || field?.type === 'rating';

  return (
    <Input
      aria-label={label}
      type={numeric ? 'number' : 'text'}
      value={
        typeof condition.value === 'number' ? String(condition.value) : textOfValue(condition.value)
      }
      onChange={({ target }) => set(numeric ? numberOf(target.value) : target.value)}
    />
  );
};

/** One rule: a field, how it compares, and the value. Off until a field is picked. */
const RuleEditor = ({
  label,
  condition,
  fields,
  onChange,
}: {
  label: string;
  condition: Condition | undefined;
  /** The record type's other fields. */
  fields: DataExtensionField[];
  onChange: (condition: Condition | undefined) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'conditions' });
  const field = fields.find((entry) => entry.key === condition?.field);

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="grid gap-2 sm:grid-cols-3">
        <Select
          value={condition?.field ?? ''}
          onValueChange={(key) => onChange({ field: key, operator: condition?.operator ?? 'eq' })}
        >
          <Select.Trigger variant="bordered" aria-label={t('field', 'Field')}>
            <Select.Value placeholder={t('always', 'Always')} />
          </Select.Trigger>
          <Select.Content>
            {fields.map((entry) => (
              <Select.Item key={entry.key} value={entry.key}>
                {entry.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        {condition && (
          <>
            <Select
              value={condition.operator}
              onValueChange={(operator) =>
                isOperator(operator) && onChange({ field: condition.field, operator })
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
                <ConditionValue condition={condition} field={field} onChange={onChange} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('clear', 'Remove condition')}
                onClick={() => onChange(undefined)}
              >
                <IconX />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/** Several rules, made through the API or carried over from old properties: read here, removable. */
const RulesSummary = ({
  label,
  condition,
  onChange,
}: {
  label: string;
  condition: Extract<DataExtensionCondition, { rules: unknown }>;
  onChange: (condition: DataExtensionCondition | undefined) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'conditions' });

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="min-w-0 flex-1">
          {condition.match === 'all'
            ? t('all-rules', '{{count}} rules, all of them', { count: condition.rules.length })
            : t('any-rule', '{{count}} rules, any one of them', { count: condition.rules.length })}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('clear', 'Remove condition')}
          onClick={() => onChange(undefined)}
        >
          <IconX />
        </Button>
      </div>
    </div>
  );
};

/**
 * "Show only while", "Hide while" or "Required while" other fields of the record type have a
 * value: one rule to edit, or a summary of several.
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
}) =>
  condition && 'rules' in condition ? (
    <RulesSummary label={label} condition={condition} onChange={onChange} />
  ) : (
    <RuleEditor label={label} condition={condition} fields={fields} onChange={onChange} />
  );
