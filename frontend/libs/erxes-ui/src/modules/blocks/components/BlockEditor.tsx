import { BlockEditorEditableContext } from '../hooks/useBlockEditorEditable';
import { BlockEditorComments } from './BlockEditorComments';
import { KeyboardEvent, MouseEvent, useRef, useState } from 'react';
import {
  SuggestionMenuController,
  TableHandlesController,
} from '@blocknote/react';

import { BlockEditorProps } from 'erxes-ui/modules/blocks/types';
import { BlockNoteView } from '@blocknote/shadcn';
import { SlashMenu } from 'erxes-ui/modules/blocks/components/SlashMenu';
import { TableHandleWithRemove } from 'erxes-ui/modules/blocks/components/TableHandleWithRemove';
import { Toolbar } from 'erxes-ui/modules/blocks/components/Toolbar';
import { cn } from 'erxes-ui/lib';
import { editorUIComponents } from 'erxes-ui/modules/blocks/constant/toolbar/editorUIComponents';
import { getSlashMenuItems } from 'erxes-ui/modules/blocks/utils/getSlashMenuItems';
import { isCodeFormattingShortcut } from 'erxes-ui/modules/blocks/utils/toolbar/isCodeFormattingShortcut';
import { isEmptyBlock } from 'erxes-ui/modules/blocks/utils/isEmptyBlock';
import { themeState } from 'erxes-ui/state';
import { useAtomValue } from 'jotai';

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
  formattingToolbar = true,
  linkToolbar = true,
  slashMenuOnTop = false,
  floatingThread = true,
  additionalSlashMenuItems,
}: BlockEditorProps) => {
  const theme = useAtomValue(themeState);
  const [focus, setFocus] = useState(false);
  const deletingText = useRef(false);

  const handleKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
    if (
      readonly ||
      disabled ||
      !(e.target instanceof Node) ||
      !editor.domElement?.contains(e.target)
    ) {
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

    deletingText.current = true;

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
      onKeyUpCapture={() => {
        deletingText.current = false;
      }}
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
      <BlockEditorEditableContext.Provider value={!readonly && !disabled}>
        <BlockNoteView
          theme={theme === 'system' ? undefined : theme}
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
          onChange={() => {
            if (deletingText.current) {
              deletingText.current = false;
              if (isEmptyBlock(editor.getTextCursorPosition().block)) {
                const view = editor._tiptapEditor.view;
                if (view) {
                  view.dispatch(view.state.tr.setStoredMarks([]));
                }
              }
            }
            onChange?.();
          }}
          comments={false}
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
          {formattingToolbar && <Toolbar />}
          <TableHandlesController tableHandle={TableHandleWithRemove} />
          <BlockEditorComments
            enabled={!!editor.comments}
            floatingThread={floatingThread}
          >
            {children}
          </BlockEditorComments>
        </BlockNoteView>
      </BlockEditorEditableContext.Provider>
    </div>
  );
};

export { Attribute, Mention } from './BlockEditorInlineContent';
