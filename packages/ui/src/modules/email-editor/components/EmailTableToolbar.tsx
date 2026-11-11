import {
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconColumnRemove,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconRowRemove,
  IconTableOff,
} from '@tabler/icons-react';
import type { Editor } from '@tiptap/core';
import { Button, Separator, Tooltip } from 'erxes-ui/components';
import { useEffect, useState } from 'react';
import { EmailTableBackground } from './EmailTableBackground';

const ACTIONS = [
  { label: 'Row above', icon: IconRowInsertTop, run: 'addRowBefore' },
  { label: 'Row below', icon: IconRowInsertBottom, run: 'addRowAfter' },
  { label: 'Delete row', icon: IconRowRemove, run: 'deleteRow' },
  { label: 'Column left', icon: IconColumnInsertLeft, run: 'addColumnBefore' },
  { label: 'Column right', icon: IconColumnInsertRight, run: 'addColumnAfter' },
  { label: 'Delete column', icon: IconColumnRemove, run: 'deleteColumn' },
  { label: 'Delete table', icon: IconTableOff, run: 'deleteTable' },
] as const;

/**
 * Shown only while the caret is inside a table: the editor has no chrome of
 * its own for one, and a table you cannot add a row to is not a table.
 */
export const EmailTableToolbar = ({ editor }: { editor: Editor | null }) => {
  const [isInTable, setIsInTable] = useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const sync = () => setIsInTable(editor.isActive('table'));

    sync();
    editor.on('transaction', sync);

    return () => {
      editor.off('transaction', sync);
    };
  }, [editor]);

  if (!editor || !isInTable) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-sm">
      {ACTIONS.map(({ label, icon: Icon, run }) => (
        <Tooltip key={run}>
          <Tooltip.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={label}
              // Without this the editor loses the cell selection on mousedown
              // and every table command becomes a no-op.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                editor.view.focus();
                editor.commands[run]();
              }}
            >
              <Icon className="size-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">{label}</Tooltip.Content>
        </Tooltip>
      ))}

      <Separator.Inline />

      <EmailTableBackground editor={editor} />
    </div>
  );
};
