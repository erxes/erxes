import { getSlashMenuItems } from '../utils/getSlashMenuItems';
import {
  SuggestionMenuController,
  TableHandlesController,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';

import { cn } from 'erxes-ui/lib';
import { themeState } from 'erxes-ui/state';
import { useAtomValue } from 'jotai';
import { KeyboardEvent, MouseEvent, useState } from 'react';
import { BlockEditorProps } from '../types';
import { SlashMenu } from './SlashMenu';
import { Toolbar } from './Toolbar';
import { isEmptyBlock } from '../utils/isEmptyBlock';
import { TableHandleWithRemove } from './TableHandleWithRemove';
import { editorUIComponents } from '../constant/editorUIComponents';
import { isCodeFormattingShortcut } from '../utils/isCodeFormattingShortcut';

export const BlockEditor = ({
  editor,
  onFocus,
  onBlur,
  onChange,
  readonly,
  children,
  className,
  style,
  disabled,
  variant = 'default',
  sideMenu = true,
  linkToolbar = true,
  slashMenuOnTop = false,
  additionalSlashMenuItems,
}: BlockEditorProps) => {
  const theme = useAtomValue(themeState);
  const [focus, setFocus] = useState(false);

  const handleKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
    if (readonly || disabled) {
      return;
    }

    if (editor.getActiveStyles().code && isCodeFormattingShortcut(e)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (e.key !== 'Backspace' && e.key !== 'Delete') {
      return;
    }

    const { block, prevBlock, nextBlock, parentBlock } =
      editor.getTextCursorPosition();

    if (parentBlock || !nextBlock || !isEmptyBlock(block)) {
      return;
    }

    if (e.key === 'Backspace' && prevBlock) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    editor.removeBlocks([block]);
    editor.setTextCursorPosition(nextBlock, 'start');
  };

  return (
    <div
      onKeyDownCapture={handleKeyDownCapture}
      onMouseDownCapture={(event: MouseEvent<HTMLDivElement>) => {
        if (
          event.button === 0 &&
          event.target instanceof Element &&
          event.target.closest('.bn-formatting-toolbar button:not(:disabled)')
        ) {
          // Toolbar clicks must preserve the editor selection for formatting.
          event.preventDefault();
        }
      }}
      className={cn(
        'erxes-blocknote',
        'transition-shadow',
        variant === 'outline' && (focus ? 'shadow-focus' : 'shadow-xs'),
        className,
      )}
    >
      <BlockNoteView
        theme={theme as 'light' | 'dark'}
        editor={editor}
        slashMenu={false}
        sideMenu={sideMenu}
        linkToolbar={linkToolbar}
        onFocus={() => {
          setFocus(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocus(false);
          onBlur?.();
        }}
        editable={!readonly && !disabled}
        onChange={onChange}
        formattingToolbar={false}
        tableHandles={false}
        shadCNComponents={editorUIComponents}
        style={style}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={(query) =>
            getSlashMenuItems(query, editor, additionalSlashMenuItems)
          }
          suggestionMenuComponent={SlashMenu}
          floatingOptions={
            slashMenuOnTop ? { placement: 'top-start' } : undefined
          }
        />
        <Toolbar />
        <TableHandlesController tableHandle={TableHandleWithRemove} />
        {children}
      </BlockNoteView>
    </div>
  );
};
