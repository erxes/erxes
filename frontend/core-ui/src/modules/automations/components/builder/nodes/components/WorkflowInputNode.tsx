import { useWorkflowEditScope } from '@/automations/context/WorkflowEditScopeProvider';
import { IconArrowBarToRight, IconPlus } from '@tabler/icons-react';
import { Handle, Position } from '@xyflow/react';
import { Button, Input, Popover } from 'erxes-ui';
import { FormEvent, useCallback, useState } from 'react';

export const WORKFLOW_INPUT_NODE_ID = 'workflow-input';

// Entry stub inside the workflow edit sheet: documents the derived input
// contract and lets the user register a new named input.
export const WorkflowInputNode = () => {
  const workflowEditScope = useWorkflowEditScope();
  const inputNames = Object.keys(workflowEditScope?.inputs || {});

  return (
    <div className="relative flex flex-col rounded-md border bg-background px-4 py-3 font-mono shadow-md">
      <div className="flex items-center gap-2 text-info">
        <IconArrowBarToRight className="size-4" />
        <span className="text-sm font-medium">Input</span>
        <WorkflowAddInputButton />
      </div>
      {inputNames.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {inputNames.map((name) => (
            <p key={name} className="text-xs text-muted-foreground">
              {name}
            </p>
          ))}
        </div>
      )}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="!size-3 !bg-info"
      />
    </div>
  );
};

const WorkflowAddInputButton = () => {
  const workflowEditScope = useWorkflowEditScope();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      workflowEditScope?.addInput?.(name);
      setName('');
      setOpen(false);
    },
    [workflowEditScope, name],
  );

  if (!workflowEditScope?.addInput) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="nodrag ml-auto size-6"
          aria-label="Add input"
        >
          <IconPlus className="size-3.5" />
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-64 p-2">
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <Input
            value={name}
            placeholder="Input name"
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      </Popover.Content>
    </Popover>
  );
};
