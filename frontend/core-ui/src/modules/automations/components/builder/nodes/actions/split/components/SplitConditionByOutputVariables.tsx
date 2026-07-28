import type { TIncomingWebhookJSONPropertySchema } from '@/automations/components/builder/nodes/triggers/webhooks/types/incomingWebhookJsonBuilder';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, DatePicker, Form, Input, Label, Select } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { TSplitConditionsConfigForm } from '../states/splitConditionsConfigForm';

type TOutputVariable = {
  id?: string;
  key?: string;
  name: string;
  label?: string;
  type?: string;
  options?: { label: string; value: string }[];
  children?: TOutputVariable[];
  arrayItemSchema?: TOutputVariable[];
  arrayItemType?: string;
};

type TOutputVariableField = {
  name: string;
  label: string;
  type: string;
  options?: { label: string; value: string }[];
};

const STRING_OPERATORS = [
  { value: 'e', label: 'equals to' },
  { value: 'dne', label: 'does not equal' },
  { value: 'c', label: 'contains' },
  { value: 'dnc', label: 'does not contain' },
  { value: 'is', label: 'is set' },
  { value: 'ins', label: 'is not set' },
];

const NUMBER_OPERATORS = [
  { value: 'numbere', label: 'equals to' },
  { value: 'numberdne', label: 'does not equal' },
  { value: 'numberigt', label: 'is greater than' },
  { value: 'numberilt', label: 'is less than' },
  { value: 'is', label: 'is set' },
  { value: 'ins', label: 'is not set' },
];

const BOOLEAN_OPERATORS = [
  { value: 'it', label: 'is true' },
  { value: 'if', label: 'is false' },
  { value: 'is', label: 'is set' },
  { value: 'ins', label: 'is not set' },
];

const DATE_OPERATORS = [
  { value: 'dateigt', label: 'is greater than' },
  { value: 'dateilt', label: 'is less than' },
  { value: 'dateis', label: 'is set' },
  { value: 'dateins', label: 'is not set' },
];

const getOperators = (type?: string) => {
  if (type === 'number') {
    return NUMBER_OPERATORS;
  }

  if (type === 'boolean') {
    return BOOLEAN_OPERATORS;
  }

  if (type === 'date') {
    return DATE_OPERATORS;
  }

  return STRING_OPERATORS;
};

const flattenOutputVariables = (
  variables: TOutputVariable[] = [],
  parentPath = '',
): TOutputVariableField[] => {
  return variables.flatMap((variable) => {
    const variableName = variable.name || variable.key;

    if (!variableName) {
      return [];
    }

    const path = parentPath ? `${parentPath}.${variableName}` : variableName;
    const label = variable.label || variableName;

    if (variable.type === 'object') {
      return flattenOutputVariables(variable.children || [], path);
    }

    if (variable.type === 'array' && variable.arrayItemType === 'object') {
      return flattenOutputVariables(variable.arrayItemSchema || [], path);
    }

    return [
      {
        name: path,
        label: parentPath ? `${parentPath}.${label}` : label,
        type: variable.type || 'string',
        options: variable.options,
      },
    ];
  });
};

const normalizeOutputVariables = (variables: unknown): TOutputVariable[] => {
  if (!Array.isArray(variables)) {
    return [];
  }

  return variables as TIncomingWebhookJSONPropertySchema[];
};

const getDefaultCondition = (contentType: string) => ({
  propertyType: contentType,
  propertyName: '',
  propertyOperator: '',
  propertyValue: '',
});

export const SplitConditionByOutputVariables = ({
  contentType,
  optionIndex,
  outputVariables,
}: {
  contentType: string;
  optionIndex: number;
  outputVariables?: unknown;
}) => {
  const form = useFormContext<TSplitConditionsConfigForm>();
  const conditionFieldsPath =
    `options.${optionIndex}.config.conditions` as const;
  const conditionsConjunctionPath =
    `options.${optionIndex}.config.conditionsConjunction` as const;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: conditionFieldsPath,
  });
  const flattenedFields = useMemo(
    () => flattenOutputVariables(normalizeOutputVariables(outputVariables)),
    [outputVariables],
  );

  const addCondition = () => append(getDefaultCondition(contentType));

  useEffect(() => {
    if (!fields.length) {
      form.setValue(conditionsConjunctionPath, 'and', { shouldDirty: true });
      append(getDefaultCondition(contentType));
    }
  }, [append, conditionsConjunctionPath, contentType, fields.length, form]);

  return (
    <div className="p-3">
      <div className="rounded-md bg-accent">
        <div className="grid grid-cols-[2fr_1fr_2fr_auto] items-center gap-2 px-4 py-2">
          <Label>Property</Label>
          <Label>Condition</Label>
          <Label>Value</Label>
          <div />
        </div>
        <div className="m-1 rounded-md bg-background p-2">
          {fields.length > 1 && (
            <Form.Field
              control={form.control}
              name={conditionsConjunctionPath}
              render={({ field }) => (
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Match</span>
                  <Select
                    value={field.value || 'and'}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger className="h-8 w-24">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="and">All</Select.Item>
                      <Select.Item value="or">Any</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              )}
            />
          )}
          <div className="flex flex-col gap-2">
            {fields.map((field, conditionIndex) => (
              <OutputVariableConditionRow
                key={field.id}
                contentType={contentType}
                optionIndex={optionIndex}
                conditionIndex={conditionIndex}
                outputFields={flattenedFields}
                onRemove={() => remove(conditionIndex)}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-2 w-full font-mono text-xs font-semibold uppercase text-accent-foreground"
            onClick={addCondition}
          >
            <IconPlus />
            Add condition
          </Button>
        </div>
      </div>
    </div>
  );
};

const OutputVariableConditionRow = ({
  contentType,
  optionIndex,
  conditionIndex,
  outputFields,
  onRemove,
}: {
  contentType: string;
  optionIndex: number;
  conditionIndex: number;
  outputFields: TOutputVariableField[];
  onRemove: () => void;
}) => {
  const form = useFormContext<TSplitConditionsConfigForm>();
  const conditionPath =
    `options.${optionIndex}.config.conditions.${conditionIndex}` as const;
  const propertyName = useWatch({
    control: form.control,
    name: `${conditionPath}.propertyName`,
  });
  const propertyOperator = useWatch({
    control: form.control,
    name: `${conditionPath}.propertyOperator`,
  });
  const selectedField = outputFields.find(({ name }) => name === propertyName);
  const operators = getOperators(selectedField?.type);
  const selectedOperator = operators.find(
    ({ value }) => value === propertyOperator,
  );
  const shouldRenderValue = ![
    'is',
    'ins',
    'it',
    'if',
    'dateis',
    'dateins',
  ].includes(selectedOperator?.value || '');

  return (
    <div className="grid grid-cols-[2fr_1fr_2fr_auto] items-start gap-2">
      <Form.Field
        control={form.control}
        name={`${conditionPath}.propertyName`}
        render={({ field }) => (
          <Form.Item className="min-w-0">
            <Select
              value={field.value}
              onValueChange={(value) => {
                form.setValue(`${conditionPath}.propertyType`, contentType, {
                  shouldDirty: true,
                });
                form.setValue(`${conditionPath}.propertyOperator`, '', {
                  shouldDirty: true,
                });
                form.setValue(`${conditionPath}.propertyValue`, '', {
                  shouldDirty: true,
                });
                field.onChange(value);
              }}
            >
              <Select.Trigger className="w-full min-w-0">
                <Select.Value placeholder="Select an field" />
              </Select.Trigger>
              <Select.Content>
                {outputFields.map(({ name, label }) => (
                  <Select.Item key={name} value={name}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={`${conditionPath}.propertyOperator`}
        render={({ field }) => (
          <Form.Item className="min-w-0">
            <Select
              value={field.value}
              disabled={!selectedField}
              onValueChange={(value) => {
                form.setValue(`${conditionPath}.propertyValue`, '', {
                  shouldDirty: true,
                });
                field.onChange(value);
              }}
            >
              <Select.Trigger className="w-full min-w-0">
                <Select.Value placeholder="Select an operator" />
              </Select.Trigger>
              <Select.Content>
                {operators.map(({ value, label }) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={`${conditionPath}.propertyValue`}
        render={({ field }) => (
          <Form.Item className="min-w-0">
            <OutputVariableConditionValueInput
              field={field}
              selectedField={selectedField}
              disabled={!selectedOperator || !shouldRenderValue}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-destructive"
        onClick={onRemove}
      >
        <IconTrash className="size-4" />
      </Button>
    </div>
  );
};

const OutputVariableConditionValueInput = ({
  field,
  selectedField,
  disabled,
}: {
  field: any;
  selectedField?: TOutputVariableField;
  disabled: boolean;
}) => {
  if (disabled) {
    return <Input className="w-full min-w-0" disabled />;
  }

  if (selectedField?.type === 'date') {
    return (
      <DatePicker
        className="w-full"
        value={field.value}
        onChange={(date) => field.onChange(date as Date)}
        placeholder="Select date"
      />
    );
  }

  if (selectedField?.options?.length) {
    return (
      <Select value={field.value} onValueChange={field.onChange}>
        <Select.Trigger className="w-full min-w-0">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {selectedField.options.map((option) => (
            <Select.Item key={option.value} value={`${option.value}`}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  return <Input {...field} className="w-full min-w-0" />;
};
