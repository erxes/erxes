import { useNodeMetaEdit } from '@/automations/components/builder/sidebar/hooks/useNodeMetaEdit';
import { NodeData } from '@/automations/types';
import { Input, Popover } from 'erxes-ui';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

// Popup-style inline editing of the active node's label/description in the
// sidebar header, for every node type (trigger, action, workflow).
export const AutomationBuilderNodeMetaEditor = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const { updateMeta, activeNodeId } = useNodeMetaEdit(activeNode);

  const [meta, setMeta] = useState({
    label: activeNode.label || '',
    description: activeNode.description || '',
  });

  // Switching to another node resets the local draft
  useEffect(() => {
    setMeta({
      label: activeNode.label || '',
      description: activeNode.description || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNodeId]);

  const handleLabelChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setMeta((previous) => ({ ...previous, label: value }));
      updateMeta('label', value);
    },
    [updateMeta],
  );

  const handleDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setMeta((previous) => ({ ...previous, description: value }));
      updateMeta('description', value);
    },
    [updateMeta],
  );

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="-mx-1 w-fit max-w-full truncate rounded px-1 text-left hover:bg-accent"
          >
            <h2 className="w-full truncate text-xl font-semibold leading-none tracking-tight">
              {meta.label || 'Untitled'}
            </h2>
          </button>
        </Popover.Trigger>
        <Popover.Content align="start" className="w-80 p-3">
          <Input
            value={meta.label}
            placeholder="Name"
            onChange={handleLabelChange}
          />
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="-mx-1 w-fit max-w-full truncate rounded px-1 text-left hover:bg-accent"
          >
            <span className="w-full truncate text-sm font-normal text-muted-foreground">
              {meta.description || 'Add description...'}
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Content align="start" className="w-80 p-3">
          <Input
            type="textarea"
            value={meta.description}
            placeholder="Description"
            onChange={handleDescriptionChange}
          />
        </Popover.Content>
      </Popover>
    </>
  );
};
