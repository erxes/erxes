import { TWorkflowInputBinding } from '@/automations/components/builder/hooks/useWorkflowInputBindings';
import { useWorkflowNodeContext } from '@/automations/context/WorkflowNodeProvider';
import { IconAlertTriangle } from '@tabler/icons-react';

// Read-only summary on the canvas node; editing happens in the node
// configuration sidebar (double-click the node), like every other node type.
export const WorkflowInputBindings = () => {
  const { bindings } = useWorkflowNodeContext();

  if (!bindings.length) {
    return null;
  }

  return (
    <div className="mt-2">
      <p className="px-1 text-xs font-medium text-muted-foreground">Inputs</p>
      <div className="mt-1 space-y-1">
        {bindings.map((binding) => (
          <WorkflowInputBindingRow key={binding.name} binding={binding} />
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
  const { danglingCount } = useWorkflowNodeContext();

  if (!danglingCount) {
    return null;
  }

  return (
    <span className="flex items-center gap-1 text-warning text-xs">
      <IconAlertTriangle className="size-3" />
      {danglingCount}
    </span>
  );
};
