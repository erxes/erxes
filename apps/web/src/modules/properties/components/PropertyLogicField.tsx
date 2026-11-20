import {
  FIELD_LOGIC_ACTIONS,
  FIELD_LOGIC_OPERATORS,
  type FieldLogic,
  type PropertyContentType,
} from '@erxes/core-contract';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Select } from 'erxes-ui';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAllFields } from '../useFields';
import type { PropertyFormApi } from './propertyFormApi';

type Rule = FieldLogic['rules'][number];

/** Operators that compare with a value; `hasValue` and `isEmpty` take none. */
const takesValue = (operator: Rule['operator']) =>
  operator !== 'hasValue' && operator !== 'isEmpty';

const isAction = (value: unknown): value is FieldLogic['action'] =>
  FIELD_LOGIC_ACTIONS.some((action) => action === value);

const isOperator = (value: unknown): value is Rule['operator'] =>
  FIELD_LOGIC_OPERATORS.some((operator) => operator === value);

/** One rule: another property, how it compares, and the value it compares with. */
const RuleRow = ({
  rule,
  fields,
  onChange,
  onRemove,
}: {
  rule: Rule;
  fields: { id: string; label: string }[];
  onChange: (rule: Rule) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  const operators: Record<Rule['operator'], string> = {
    is: t('logic-is', 'is'),
    isNot: t('logic-is-not', 'is not'),
    contains: t('logic-contains', 'contains'),
    greaterThan: t('logic-greater-than', 'is greater than'),
    lessThan: t('logic-less-than', 'is less than'),
    hasValue: t('logic-has-value', 'has a value'),
    isEmpty: t('logic-is-empty', 'is empty'),
  };

  return (
    <div className="flex gap-2">
      <Select value={rule.fieldId} onValueChange={(fieldId) => onChange({ ...rule, fieldId })}>
        <Select.Trigger className="flex-1" aria-label={t('select-property', 'Select property')}>
          <Select.Value placeholder={t('select-property', 'Select property')} />
        </Select.Trigger>
        <Select.Content>
          {fields.map((field) => (
            <Select.Item key={field.id} value={field.id}>
              {field.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Select
        value={rule.operator}
        onValueChange={(operator) => {
          if (isOperator(operator))
            onChange({ ...rule, operator, value: takesValue(operator) ? rule.value : null });
        }}
      >
        <Select.Trigger className="w-40" aria-label={t('logic-operator', 'Comparison')}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {FIELD_LOGIC_OPERATORS.map((operator) => (
            <Select.Item key={operator} value={operator}>
              {operators[operator]}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {takesValue(rule.operator) && (
        <Input
          className="w-40"
          aria-label={t('logic-value', 'Value')}
          // FieldLogic's limit: a longer value would fail the save with nowhere to show why.
          maxLength={200}
          value={rule.value ?? ''}
          onChange={(event) => onChange({ ...rule, value: event.target.value })}
        />
      )}
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-8 shrink-0"
        aria-label={t('logic-remove-rule', 'Remove rule')}
        onClick={onRemove}
      >
        <IconTrash />
      </Button>
    </div>
  );
};

/**
 * The property's logic: shown or hidden while every rule on the record's other properties
 * matches. Without rules it always shows.
 */
export const PropertyLogicField = ({
  form,
  contentType,
  fieldId,
}: {
  form: PropertyFormApi;
  contentType: PropertyContentType;
  fieldId?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const rules = useFieldArray({ control: form.control, name: 'logic.rules' });
  const watched = useWatch({ control: form.control, name: 'logic.rules' });
  const action = useWatch({ control: form.control, name: 'logic.action' });
  const others = useAllFields(contentType).fields.filter((field) => field.id !== fieldId);
  const [first] = others;

  return (
    <Form.Item className="flex-auto">
      <Form.Label>{t('logic', 'Logic')}</Form.Label>
      {rules.fields.length > 0 && (
        <Select
          value={action}
          onValueChange={(next) => {
            if (isAction(next)) form.setValue('logic.action', next, { shouldDirty: true });
          }}
        >
          <Select.Trigger aria-label={t('logic-action', 'When every rule matches')}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="show">{t('show-this-field', 'Show this field')}</Select.Item>
            <Select.Item value="hide">{t('hide-this-field', 'Hide this field')}</Select.Item>
          </Select.Content>
        </Select>
      )}
      {rules.fields.map((item, index) => {
        const rule = watched[index];

        return (
          rule && (
            <RuleRow
              key={item.id}
              rule={{ ...rule, value: rule.value ?? null }}
              fields={others}
              onChange={(next) => rules.update(index, next)}
              onRemove={() => rules.remove(index)}
            />
          )
        );
      })}
      <Button
        type="button"
        variant="secondary"
        className="self-start"
        disabled={!first || rules.fields.length >= 10}
        onClick={() => {
          if (first) rules.append({ fieldId: first.id, operator: 'hasValue', value: null });
        }}
      >
        <IconPlus />
        {t('logic-add-rule', 'Add rule')}
      </Button>
      <Form.Description>
        {t(
          'logic-hint',
          "Show or hide this property by other properties' values. Without rules it always shows.",
        )}
      </Form.Description>
    </Form.Item>
  );
};
