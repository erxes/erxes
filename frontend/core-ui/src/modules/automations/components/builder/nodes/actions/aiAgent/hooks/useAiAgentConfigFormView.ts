import {
  TAiAgentConfigTab,
  useAiAgentConfigTabs,
} from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentConfigTabs';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { useCallback } from 'react';
import { DeepPartial, FieldErrors } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';
import { useAiAgentBuilderSheet } from './useAiAgentBuilderSheet';
import { useAiAgentConfigForm } from './useAiAgentConfigForm';

// How many outputs the step's goal produces, shown on the rail
const outputCountOf = (config?: DeepPartial<TAiAgentConfigForm>) => {
  if (config?.goalType === 'splitTopic') {
    return config.topics?.length || 0;
  }

  if (config?.goalType === 'classification') {
    return config.objectFields?.length || 0;
  }

  if (config?.goalType === 'generateText') {
    return (config.captureFields?.length || 0) + (config.tools?.length || 0);
  }

  return 0;
};

/**
 * The AI agent step's form: its tabs, the agent sheet opened from it, and a
 * save that jumps to the tab holding the first error.
 */
export const useAiAgentConfigFormView = ({
  currentAction,
  handleSave,
}: Pick<
  TAutomationActionProps<TAiAgentConfigForm>,
  'currentAction' | 'handleSave'
>) => {
  const configForm = useAiAgentConfigForm({ currentAction });
  const { form, handleSubmit, handleValidationErrors, config } = configForm;
  const builderSheet = useAiAgentBuilderSheet({
    onCreated: (agentId) =>
      form.setValue('aiAgentId', agentId, { shouldDirty: true }),
  });
  const tabs = useAiAgentConfigTabs();
  const { showFirstError, setTab } = tabs;

  const handleInvalid = useCallback(
    (errors: FieldErrors<TAiAgentConfigForm>) => {
      showFirstError(errors);
      handleValidationErrors(errors);
    },
    [showFirstError, handleValidationErrors],
  );

  const changeTab = useCallback(
    (value: string) => setTab(value as TAiAgentConfigTab),
    [setTab],
  );

  return {
    ...configForm,
    ...builderSheet,
    ...tabs,
    changeTab,
    outputCount: outputCountOf(config),
    onSave: handleSubmit(handleSave, handleInvalid),
  };
};
