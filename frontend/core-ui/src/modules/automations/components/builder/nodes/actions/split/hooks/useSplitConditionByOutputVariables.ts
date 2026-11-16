import { TSplitConditionsConfigForm } from '@/automations/components/builder/nodes/actions/split/states/splitConditionsConfigForm';
import {
  defaultSplitCondition,
  flattenOutputVariables,
  normalizeOutputVariables,
  splitOperatorsOf,
  splitOperatorTakesValue,
  TOutputVariableField,
} from '@/automations/components/builder/nodes/actions/split/utils/splitOutputVariableConditions';
import { useCallback, useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

/** An option's condition rows, started with one row and an "and" join. */
export const useSplitConditionByOutputVariables = ({
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
  const outputFields = useMemo(
    () => flattenOutputVariables(normalizeOutputVariables(outputVariables)),
    [outputVariables],
  );

  const addCondition = useCallback(
    () => append(defaultSplitCondition(contentType)),
    [append, contentType],
  );

  useEffect(() => {
    if (!fields.length) {
      form.setValue(conditionsConjunctionPath, 'and', { shouldDirty: true });
      append(defaultSplitCondition(contentType));
    }
  }, [append, conditionsConjunctionPath, contentType, fields.length, form]);

  return {
    control: form.control,
    conditionsConjunctionPath,
    fields,
    showConjunction: fields.length > 1,
    outputFields,
    addCondition,
    removeCondition: remove,
  };
};

/**
 * One condition row: the operators its field's type allows, and clearing what
 * depends on a choice when that choice changes.
 */
export const useOutputVariableConditionRow = ({
  contentType,
  optionIndex,
  conditionIndex,
  outputFields,
}: {
  contentType: string;
  optionIndex: number;
  conditionIndex: number;
  outputFields: TOutputVariableField[];
}) => {
  const form = useFormContext<TSplitConditionsConfigForm>();
  const conditionPath =
    `options.${optionIndex}.config.conditions.${conditionIndex}` as const;
  const [propertyName, propertyOperator] = useWatch({
    control: form.control,
    name: [
      `${conditionPath}.propertyName`,
      `${conditionPath}.propertyOperator`,
    ],
  });
  const selectedField = outputFields.find(({ name }) => name === propertyName);
  const operators = splitOperatorsOf(selectedField?.type);
  const selectedOperator = operators.find(
    ({ value }) => value === propertyOperator,
  );

  const clear = useCallback(
    (key: 'propertyOperator' | 'propertyValue') =>
      form.setValue(`${conditionPath}.${key}`, '', { shouldDirty: true }),
    [form, conditionPath],
  );

  const onPropertyChange = useCallback(
    (onChange: (value: string) => void) => (value: string) => {
      form.setValue(`${conditionPath}.propertyType`, contentType, {
        shouldDirty: true,
      });
      clear('propertyOperator');
      clear('propertyValue');
      onChange(value);
    },
    [form, conditionPath, contentType, clear],
  );

  const onOperatorChange = useCallback(
    (onChange: (value: string) => void) => (value: string) => {
      clear('propertyValue');
      onChange(value);
    },
    [clear],
  );

  return {
    control: form.control,
    conditionPath,
    selectedField,
    operators,
    valueDisabled:
      !selectedOperator || !splitOperatorTakesValue(selectedOperator.value),
    onPropertyChange,
    onOperatorChange,
  };
};
