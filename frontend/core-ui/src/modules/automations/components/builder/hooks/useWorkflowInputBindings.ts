import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { isDanglingBinding } from '@/automations/utils/workflowInputs';
import { useCallback, useMemo } from 'react';
import { Path } from 'react-hook-form';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';

export type TWorkflowInputBinding = {
  name: string;
  expression: string;
  isDangling: boolean;
};

export const useWorkflowInputBindings = (workflowId: string) => {
  const { actions, workflows } = useAutomationNodes();
  const { setAutomationBuilderFormValue } = useAutomationFormController();

  const workflowIndex = useMemo(
    () => (workflows || []).findIndex(({ id }) => id === workflowId),
    [workflows, workflowId],
  );
  const inputs = workflows?.[workflowIndex]?.config?.inputs;

  const bindings: TWorkflowInputBinding[] = useMemo(() => {
    const actionIds = new Set(actions.map(({ id }) => id));

    return Object.entries(inputs || {}).map(([name, expression]) => ({
      name,
      expression: String(expression),
      isDangling: isDanglingBinding(String(expression), actionIds),
    }));
  }, [inputs, actions]);

  const danglingCount = useMemo(
    () => bindings.filter(({ isDangling }) => isDangling).length,
    [bindings],
  );

  const updateBinding = useCallback(
    (name: string, expression: string) => {
      setAutomationBuilderFormValue(
        `workflows.${workflowIndex}.config.inputs.${name}` as Path<TAutomationBuilderForm>,
        expression,
      );
    },
    [workflowIndex, setAutomationBuilderFormValue],
  );

  return { bindings, danglingCount, updateBinding };
};
