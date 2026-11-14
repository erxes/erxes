import { useNodeMetaEdit } from '@/automations/components/builder/sidebar/hooks/useNodeMetaEdit';
import { NodeData } from '@/automations/types';
import { ChangeEvent, KeyboardEvent, useCallback, useState } from 'react';

type TNodeMetaField = 'label' | 'description';

const metaOf = (node: NodeData) => ({
  label: node.label || '',
  description: node.description || '',
});

/**
 * The active node's label and description as a local draft, written through
 * as typed; switching to another node starts a new draft.
 */
export const useAutomationBuilderNodeMetaEditor = (activeNode: NodeData) => {
  const { updateMeta, activeNodeId } = useNodeMetaEdit(activeNode);
  const [meta, setMeta] = useState(() => metaOf(activeNode));
  const [draftNodeId, setDraftNodeId] = useState(activeNodeId);

  if (draftNodeId !== activeNodeId) {
    setDraftNodeId(activeNodeId);
    setMeta(metaOf(activeNode));
  }

  const changeField = useCallback(
    (field: TNodeMetaField) => (value: string) => {
      setMeta((previous) => ({ ...previous, [field]: value }));
      updateMeta(field, value);
    },
    [updateMeta],
  );

  return { meta, activeNodeId, changeField };
};

/**
 * Text that turns into an input where it stands. Edits apply as typed;
 * Enter or leaving ends editing, Escape restores the value it started with.
 */
export const useAutomationNodeMetaInlineField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [initialValue, setInitialValue] = useState<string | null>(null);

  const startEditing = useCallback(() => setInitialValue(value), [value]);
  const stopEditing = useCallback(() => setInitialValue(null), []);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
    [onChange],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        stopEditing();
      }

      if (event.key === 'Escape' && initialValue !== null) {
        event.stopPropagation();
        onChange(initialValue);
        stopEditing();
      }
    },
    [initialValue, onChange, stopEditing],
  );

  return {
    isEditing: initialValue !== null,
    startEditing,
    stopEditing,
    handleInputChange,
    handleKeyDown,
  };
};
