import { BlockEditorEditableContext } from '../hooks/useBlockEditorEditable';
import { useState } from 'react';
import { SuggestionMenuController, TableHandlesController } from '@blocknote/react';
import {
  keepSelectionOnToolbarClick,
  useBlockEditorKeys,
} from 'erxes-ui/modules/blocks/hooks/useBlockEditorKeys';
import type { BlockEditorProps } from 'erxes-ui/modules/blocks/types/TextEditor';
import { BlockNoteView } from '@blocknote/shadcn';
import { SlashMenu } from 'erxes-ui/modules/blocks/components/SlashMenu';
import { TableHandleWithRemove } from 'erxes-ui/modules/blocks/components/TableHandleWithRemove';
import { Toolbar } from 'erxes-ui/modules/blocks/components/BlockToolbar';
import { cn } from 'erxes-ui/lib/utils';
import { cva } from 'class-variance-authority';
import { editorUIComponents } from 'erxes-ui/modules/blocks/constant/toolbar/editorUIComponents';
import { useSlashMenuItems } from 'erxes-ui/modules/blocks/hooks/useSlashMenuItems';
import { themeState } from 'erxes-ui/state/themeState';
import { useAtomValue } from 'jotai';

const blockEditorVariants = cva('erxes-blocknote transition', {
  variants: {
    variant: {
      // Bare text: the screen draws any box around it.
      default: '',
      // A field: the drop shadow of an input, its focus ring and its text size.
      outline: 'rounded-md pt-1 text-sm styled-scroll shadow-xs data-focused:shadow-focus',
      // A value in a side panel: no border until hovered or focused, the field's text size.
      ghost:
        'rounded-sm pt-1 text-sm styled-scroll hover:bg-accent focus-within:bg-background focus-within:shadow-focus',
    },
  },
  defaultVariants: { variant: 'default' },
});

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
  variant,
  sideMenu = true,
  formattingToolbar = true,
  linkToolbar = true,
  slashMenuOnTop = false,
  additionalSlashMenuItems,
}: BlockEditorProps) => {
  const theme = useAtomValue(themeState);
  const [focus, setFocus] = useState(false);
  const getSlashMenuItems = useSlashMenuItems(editor, additionalSlashMenuItems);
  const editable = !readonly && !disabled;

  const { onKeyDownCapture, onKeyUpCapture, clearMarksAfterDelete } = useBlockEditorKeys(
    editor,
    editable,
  );

  return (
    <div
      onKeyDownCapture={onKeyDownCapture}
      onKeyUpCapture={onKeyUpCapture}
      onMouseDownCapture={keepSelectionOnToolbarClick}
      data-focused={focus || undefined}
      className={cn(blockEditorVariants({ variant }), className)}
    >
      <BlockEditorEditableContext.Provider value={editable}>
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
          editable={editable}
          onChange={() => {
            clearMarksAfterDelete();
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
            getItems={getSlashMenuItems}
            suggestionMenuComponent={SlashMenu}
            floatingUIOptions={
              slashMenuOnTop ? { useFloatingOptions: { placement: 'top-start' } } : undefined
            }
          />
          {formattingToolbar && <Toolbar />}
          <TableHandlesController tableHandle={TableHandleWithRemove} />
          {children}
        </BlockNoteView>
      </BlockEditorEditableContext.Provider>
    </div>
  );
};
