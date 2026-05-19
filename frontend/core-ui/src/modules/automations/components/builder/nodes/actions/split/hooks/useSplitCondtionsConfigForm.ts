import { useAutomationTrigger } from '@/automations/components/builder/hooks/useAutomationTrigger';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  generateAutomationElementId,
  TAutomationAction,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  splitConditionsConfigFormSchema,
  TSplitConditionsConfigForm,
} from '../states/splitConditionsConfigForm';

const getDefaultOption = (): TSplitConditionsConfigForm['options'][number] => ({
  id: generateAutomationElementId(),
  label: 'Option 1',
});

export const useSplitCondtionsConfigForm = (
  currentAction: TAutomationAction<TSplitConditionsConfigForm>,
) => {
  const { trigger } = useAutomationTrigger(currentAction.id);
  const contentType = trigger?.type || '';
  const isCustomTrigger = Boolean(trigger?.isCustom);
  const outputVariables =
    (trigger?.config as any)?.outVariables ||
    (trigger?.config as any)?.outputVariables ||
    (trigger?.config as any)?.schema ||
    [];
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Split conditions configuration',
  });
  const form = useForm<TSplitConditionsConfigForm>({
    resolver: zodResolver(splitConditionsConfigFormSchema),
    defaultValues: {
      options: currentAction.config?.options?.length
        ? currentAction.config.options
        : [getDefaultOption()],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
    keyName: 'fieldId',
  });
  const [dirtyConditionOptions, setDirtyConditionOptions] = useState<
    Record<string, boolean>
  >({});
  const hasDirtyConditionOptions = Object.values(dirtyConditionOptions).some(
    Boolean,
  );

  const handleConditionDirtyChange = useCallback(
    (optionId: string, isDirty: boolean) => {
      setDirtyConditionOptions((current) => ({
        ...current,
        [optionId]: isDirty,
      }));
    },
    [],
  );

  const addOption = () => {
    append({
      id: generateAutomationElementId(),
      label: `Option ${fields.length + 1}`,
    });
  };

  return {
    form,
    addOption,
    handleConditionDirtyChange,
    hasDirtyConditionOptions,
    fields,
    contentType,
    isCustomTrigger,
    outputVariables,
    handleValidationErrors,
    remove,
  };
};
