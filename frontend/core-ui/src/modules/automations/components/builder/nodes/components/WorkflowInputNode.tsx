import {
  useWorkflowAddInput,
  useWorkflowInputNames,
} from '@/automations/components/builder/nodes/hooks/useWorkflowInputNode';
import { IconArrowBarToRight, IconPlus } from '@tabler/icons-react';
import { Handle, Position } from '@xyflow/react';
import { Button, Input, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const WORKFLOW_INPUT_NODE_ID = 'workflow-input';

// Entry stub inside the workflow edit sheet: documents the derived input
// contract and lets the user register a new named input.
export const WorkflowInputNode = () => {
  const { t } = useTranslation('automations');
  const inputNames = useWorkflowInputNames();

  return (
    <div className="relative flex flex-col rounded-md border bg-background px-4 py-3 font-mono shadow-md">
      <div className="flex items-center gap-2 text-info">
        <IconArrowBarToRight className="size-4" />
        <span className="text-sm font-medium">{t('workflow-input-title')}</span>
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
  const { t } = useTranslation('automations');
  const { canAdd, open, setOpen, name, onNameChange, handleSubmit } =
    useWorkflowAddInput();

  if (!canAdd) {
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
          aria-label={t('workflow-input-add-label')}
        >
          <IconPlus className="size-3.5" />
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-64 p-2">
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <Input
            value={name}
            placeholder={t('workflow-input-name-placeholder')}
            onChange={onNameChange}
          />
          <Button type="submit" size="sm">
            {t('workflow-input-add')}
          </Button>
        </form>
      </Popover.Content>
    </Popover>
  );
};
