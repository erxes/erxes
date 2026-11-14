import { NOTE_COLORS, NOTE_DEFAULT_COLOR } from '@/automations/constants/notes';
import { useAutomationNoteActions } from '@/automations/hooks/useAutomationNotes';
import { OnResizeEnd } from '@xyflow/react';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

type TNoteData = { content: string; color?: string; readOnly?: boolean };

/**
 * A note's draft and whether it is being written. A note with nothing in it
 * opens straight into writing: derived from the saved value, never from the
 * draft, or the first keystroke would close the editor before it committed.
 */
export const useNoteNode = (
  id: string,
  data: TNoteData,
  selected?: boolean,
) => {
  const { updateNote, removeNote } = useAutomationNoteActions();
  const [content, setContent] = useState(data.content || '');
  const [isEditing, setIsEditing] = useState(!data.content?.trim());
  const color = data.color || NOTE_DEFAULT_COLOR;

  // Undo or a reload replaces the form value under us
  useEffect(() => setContent(data.content || ''), [data.content]);

  const swatches = useMemo(
    () =>
      Object.entries(NOTE_COLORS).map(([value, { swatch }]) => ({
        value,
        swatch,
        active: color === value,
        select: () => updateNote(id, { color: value }),
      })),
    [color, id, updateNote],
  );

  const commit = useCallback(() => {
    setIsEditing(false);

    if (content !== data.content) {
      updateNote(id, { content });
    }
  }, [content, data.content, id, updateNote]);

  const startEditing = useCallback(() => {
    if (!data.readOnly) {
      setIsEditing(true);
    }
  }, [data.readOnly]);

  const onContentChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => setContent(event.target.value),
    [],
  );

  const onResizeEnd: OnResizeEnd = useCallback(
    (_event, { width, height }) => updateNote(id, { width, height }),
    [id, updateNote],
  );

  const remove = useCallback(() => removeNote(id), [id, removeNote]);

  return {
    content,
    isEditing,
    showEditor: !data.readOnly && isEditing,
    showControls: !!selected && !data.readOnly,
    palette: NOTE_COLORS[color] || NOTE_COLORS[NOTE_DEFAULT_COLOR],
    swatches,
    commit,
    startEditing,
    onContentChange,
    onResizeEnd,
    remove,
  };
};
