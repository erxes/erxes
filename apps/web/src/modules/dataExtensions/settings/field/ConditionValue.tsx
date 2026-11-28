import type { DataExtensionField, DataExtensionRule } from '@erxes/core-contract';
import { Input, MultipleSelector, Select, StringArrayInput } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { numberOf, stringsOf, textOfValue } from '../../form/inputProps';

/** How a rule compares the other field's value, in the member's words. */
export const OPERATORS = {
  eq: 'is',
  neq: 'is not',
  in: 'is one of',
  isNotEmpty: 'has a value',
  isEmpty: 'is empty',
  contains: 'contains',
  greaterThan: 'is more than',
  lessThan: 'is less than',
} satisfies Record<DataExtensionRule['operator'], string>;

/** Operators that compare with no value. */
const NO_VALUE: ReadonlySet<string> = new Set(['isNotEmpty', 'isEmpty']);

export const isOperator = (value: string): value is DataExtensionRule['operator'] =>
  Object.hasOwn(OPERATORS, value);

/** The value a rule compares with, typed as its field's values are. */
export const ConditionValue = ({
  rule,
  field,
  onChange,
}: {
  rule: DataExtensionRule;
  field: DataExtensionField | undefined;
  onChange: (rule: DataExtensionRule) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'conditions' });

  const options = (field?.options ?? []).map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const set = (value: DataExtensionRule['value']) => onChange({ ...rule, value });
  const label = t('value', 'Value');

  if (NO_VALUE.has(rule.operator)) return null;

  if (rule.operator === 'in') {
    const picked = stringsOf(rule.value);

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
        value={typeof rule.value === 'boolean' ? String(rule.value) : textOfValue(rule.value)}
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
      value={typeof rule.value === 'number' ? String(rule.value) : textOfValue(rule.value)}
      onChange={({ target }) => set(numeric ? numberOf(target.value) : target.value)}
    />
  );
};
