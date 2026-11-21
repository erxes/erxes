import type { DataExtensionField, DataExtensionFieldSettings } from '@erxes/core-contract';
import { IconX } from '@tabler/icons-react';
import { Button, Input, Label, MultipleSelector, Select, StringArrayInput } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { numberOf, stringsOf, textOfValue } from '../../form/inputProps';

type Condition = NonNullable<DataExtensionFieldSettings['visibleWhen']>;

const OPERATORS = {
  eq: 'is',
  neq: 'is not',
  in: 'is one of',
  isNotEmpty: 'has a value',
} satisfies Record<Condition['operator'], string>;

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

  if (condition.operator === 'isNotEmpty') return null;

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

/**
 * "Show only while" / "Required while" another field of the record type has a value: a field,
 * how it compares, and the value. Off until a field is picked.
 */
export const ConditionEditor = ({
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
