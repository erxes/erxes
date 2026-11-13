import { TWorkflowInputBinding } from '@/automations/components/builder/hooks/useWorkflowInputBindings';
import { useWorkflowNodeContext } from '@/automations/context/WorkflowNodeProvider';
import { IconAlertTriangle, IconRepeat } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

// Read-only summary on the canvas node; editing happens in the node
// configuration sidebar (double-click the node), like every other node type.
export const WorkflowInputBindings = () => {
  const { t } = useTranslation('automations');
  const { bindings, forEach } = useWorkflowNodeContext();

  if (!bindings.length && !forEach) {
    return null;
  }

  return (
    <div className="mt-2">
      {forEach && (
        <div className="mb-2 flex items-center gap-2 px-1 text-xs">
          <IconRepeat className="size-3 shrink-0 text-info" />
          <span className="shrink-0">{t('workflow-for-each-title')}</span>
          <span className="min-w-0 flex-1 truncate font-mono text-primary">
            {forEach.items}
          </span>
        </div>
      )}
      {!!bindings.length && (
        <p className="px-1 text-xs font-medium text-muted-foreground">
          {t('inputs')}
        </p>
      )}
      <div className="mt-1 space-y-1">
        {bindings.map((binding) => (
          <WorkflowInputBindingRow
            key={binding.name}
            binding={
              forEach?.itemInput === binding.name
                ? {
                    ...binding,
                    expression: t('workflow-for-each-item-short'),
                    isDangling: false,
                  }
                : binding
            }
          />
        ))}
      </div>
    </div>
  );
};

const WorkflowInputBindingRow = ({
  binding,
}: {
  binding: TWorkflowInputBinding;
}) => (
  <div className="flex items-center gap-2 px-1 text-xs">
    <span className="shrink-0">{binding.name}</span>
    <span className="shrink-0 text-muted-foreground">:</span>
    <span className="min-w-0 flex-1 truncate font-mono text-primary">
      {binding.expression}
    </span>
    {binding.isDangling && (
      <IconAlertTriangle className="size-3 shrink-0 text-warning" />
    )}
  </div>
);

export const WorkflowInputsBadge = () => {
  const { danglingCount, forEachError } = useWorkflowNodeContext();
  const problems = danglingCount + (forEachError ? 1 : 0);

  if (!problems) {
    return null;
  }

  return (
    <span className="flex items-center gap-1 text-warning text-xs">
      <IconAlertTriangle className="size-3" />
      {problems}
    </span>
  );
};
