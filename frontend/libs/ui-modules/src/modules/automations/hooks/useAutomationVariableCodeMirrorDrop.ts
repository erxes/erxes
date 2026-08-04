import { EditorView } from '@codemirror/view';
import { useMemo, useState } from 'react';
import { getAutomationVariableDragData } from '../utils/automationVariableDragUtils';

export const useAutomationVariableCodeMirrorDrop = ({
  onChange,
}: {
  onChange?: (value: string) => void;
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const editorExtensions = useMemo(
    () => [
      EditorView.domEventHandlers({
        dragover: (event) => {
          const payload = getAutomationVariableDragData(event.dataTransfer);

          if (!payload) {
            return false;
          }

          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = 'copy';
          setIsDragActive(true);

          return true;
        },
        dragleave: () => {
          setIsDragActive(false);
          return false;
        },
        drop: (event, view) => {
          const payload = getAutomationVariableDragData(event.dataTransfer);

          setIsDragActive(false);

          if (!payload || !onChange) {
            return false;
          }

          event.preventDefault();
          event.stopPropagation();

          const { from, to } = view.state.selection.main;
          const anchor = from + payload.token.length;

          view.dispatch(
            view.state.update({
              changes: {
                from,
                to,
                insert: payload.token,
              },
              selection: {
                anchor,
                head: anchor,
              },
              scrollIntoView: true,
            }),
          );

          view.focus();
          onChange(view.state.doc.toString());

          return true;
        },
      }),
    ],
    [onChange],
  );

  return {
    isDragActive,
    editorExtensions,
  };
};
