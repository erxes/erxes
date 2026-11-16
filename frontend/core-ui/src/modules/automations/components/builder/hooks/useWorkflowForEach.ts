import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useCallback, useMemo } from 'react';
import { Path } from 'react-hook-form';

export type TWorkflowForEachOnItemError = 'continue' | 'stop';

export type TWorkflowForEach = {
  items: string;
  itemInput: string;
  onItemError?: TWorkflowForEachOnItemError;
};

export type TWorkflowForEachError = 'list-required' | 'item-input-required';

export const workflowForEachError = (
  forEach: TWorkflowForEach | undefined,
  inputNames: string[],
): TWorkflowForEachError | null => {
  if (!forEach) {
    return null;
  }

  if (!forEach.items?.trim()) {
    return 'list-required';
  }

  if (!inputNames.includes(forEach.itemInput)) {
    return 'item-input-required';
  }

  return null;
};

export const useWorkflowForEach = (workflowId: string) => {
  const { workflows } = useAutomationNodes();
  const { setAutomationBuilderFormValue } = useAutomationFormController();

  const workflowIndex = useMemo(
    () => (workflows || []).findIndex(({ id }) => id === workflowId),
    [workflows, workflowId],
  );
  const config = workflows?.[workflowIndex]?.config;
  const forEach: TWorkflowForEach | undefined = config?.forEach;
  const inputNames = useMemo(
    () => Object.keys(config?.inputs || {}),
    [config?.inputs],
  );

  const setForEach = useCallback(
    (value: TWorkflowForEach | undefined) => {
      setAutomationBuilderFormValue(
        `workflows.${workflowIndex}.config.forEach` as Path<TAutomationBuilderForm>,
        value,
      );
    },
    [workflowIndex, setAutomationBuilderFormValue],
  );

  const toggleForEach = useCallback(
    (enabled: boolean) =>
      setForEach(
        enabled
          ? {
              items: '',
              itemInput: inputNames.length === 1 ? inputNames[0] : '',
              onItemError: 'continue',
            }
          : undefined,
      ),
    [setForEach, inputNames],
  );

  const updateForEach = useCallback(
    (patch: Partial<TWorkflowForEach>) => {
      if (forEach) {
        setForEach({ ...forEach, ...patch });
      }
    },
    [forEach, setForEach],
  );

  return {
    forEach,
    forEachError: workflowForEachError(forEach, inputNames),
    inputNames,
    toggleForEach,
    updateForEach,
  };
};
