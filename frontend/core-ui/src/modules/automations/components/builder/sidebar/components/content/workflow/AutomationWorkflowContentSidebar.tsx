import { TWorkflowInputBinding } from '@/automations/components/builder/hooks/useWorkflowInputBindings';
import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  useWorkflowNodeContext,
  WorkflowNodeProvider,
} from '@/automations/context/WorkflowNodeProvider';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useCallback } from 'react';
import { PlaceholderInput } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AutomationWorkflowContentSidebar = () => {
  // Node data carries no id — the active node id lives in the query params,
  // same as the action sidebar.
  const { queryParams } = useAutomation();

  return (
    <WorkflowNodeProvider workflowId={queryParams?.activeNodeId || ''}>
      <WorkflowInputBindingFields />
    </WorkflowNodeProvider>
  );
};

const WorkflowInputBindingFields = () => {
  const { t } = useTranslation('automations');
  const { bindings } = useWorkflowNodeContext();

  if (!bindings.length) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        {t('sidebar-workflow-no-inputs')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h4 className="text-sm font-semibold">{t('inputs')}</h4>
      {bindings.map((binding) => (
        <WorkflowInputBindingField key={binding.name} binding={binding} />
      ))}
    </div>
  );
};

const WorkflowInputBindingField = ({
  binding,
}: {
  binding: TWorkflowInputBinding;
}) => {
  const { updateBinding } = useWorkflowNodeContext();

  const handleChange = useCallback(
    (expression: string) => updateBinding(binding.name, expression),
    [updateBinding, binding.name],
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{binding.name}</span>
        {binding.isDangling && (
          <IconAlertTriangle className="size-3.5 shrink-0 text-warning" />
        )}
      </div>
      <PlaceholderInput value={binding.expression} onChange={handleChange} />
    </div>
  );
};
