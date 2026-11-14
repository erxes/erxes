import { TWorkflowEditorMeta } from '@/automations/components/builder/nodes/hooks/useWorkflowEditor';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { AutomationNodeType } from '@/automations/types';
import { ChangeEvent, useCallback } from 'react';

/** The header's name and description inputs, and opening the action library. */
export const useWorkflowEditorHeader = (
  onMetaChange: (key: keyof TWorkflowEditorMeta, value: string) => void,
) => {
  const { handleNodeLibraryToggle } = useAutomationBuilderSidebarHooks();

  const onNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      onMetaChange('name', event.currentTarget.value),
    [onMetaChange],
  );

  const onDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      onMetaChange('description', event.currentTarget.value),
    [onMetaChange],
  );

  const openActionLibrary = useCallback(
    () => handleNodeLibraryToggle(AutomationNodeType.Action),
    [handleNodeLibraryToggle],
  );

  return { onNameChange, onDescriptionChange, openActionLibrary };
};
