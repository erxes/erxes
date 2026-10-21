import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { type IBlockEditor } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { parseDescriptionBlocks } from '@/operation/utils/parseDescriptionBlocks';
import { useDescriptionEditor } from '@/operation/hooks/useDescriptionEditor';
import { normalizeDescriptionBlocks } from '@/operation/utils/normalizeDescriptionBlocks';
import type {
  TaskFieldsEditorOptions,
  TaskFieldsEditorState,
} from '@/task/types/taskFields';

export const useTaskFieldsEditor = ({
  task,
  descriptionPlaceholder,
}: TaskFieldsEditorOptions): TaskFieldsEditorState => {
  const { _id: taskId, name: _name, description } = task;
  const [descriptionContent, setDescriptionContent] =
    useState<IBlockEditor['document']>();
  const { editor, isReady: isDescriptionReady } = useDescriptionEditor(
    description,
    descriptionPlaceholder,
  );
  const { updateTask } = useUpdateTask();
  const [name, setName] = useState(_name);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const handleDescriptionChange = (): void => {
    setDescriptionContent(normalizeDescriptionBlocks(editor.document));
  };

  const [debouncedDescriptionContent] = useDebounce(descriptionContent, 1000);
  const [debouncedName] = useDebounce(name, 1000);

  useEffect(() => {
    if (!debouncedName || debouncedName === _name) return;
    updateTask({
      variables: {
        _id: taskId,
        name: debouncedName,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);
  useEffect(() => {
    if (!debouncedDescriptionContent) return;
    if (
      JSON.stringify(debouncedDescriptionContent) ===
      JSON.stringify(parseDescriptionBlocks(description))
    ) {
      return;
    }
    updateTask({
      variables: {
        _id: taskId,
        description: JSON.stringify(debouncedDescriptionContent),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescriptionContent]);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [name]);

  return {
    name,
    setName,
    editor,
    isDescriptionReady,
    textareaRef,
    handleDescriptionChange,
  };
};
