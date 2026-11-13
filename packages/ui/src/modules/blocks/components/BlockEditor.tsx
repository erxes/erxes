import { BlockEditorEditableContext } from '../hooks/useBlockEditorEditable';
import { BlockEditorComments } from './BlockEditorComments';
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
import { editorUIComponents } from 'erxes-ui/modules/blocks/constant/toolbar/editorUIComponents';
import { getSlashMenuItems } from 'erxes-ui/modules/blocks/utils/getSlashMenuItems';
import { themeState } from 'erxes-ui/state/themeState';
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
      className={cn(
        'erxes-blocknote',
        'transition-shadow',
        variant === 'outline' && (focus ? 'shadow-focus' : 'shadow-xs'),
        className,
      )}
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
            getItems={(query) => getSlashMenuItems(query, editor, additionalSlashMenuItems)}
            suggestionMenuComponent={SlashMenu}
            floatingOptions={slashMenuOnTop ? { placement: 'top-start' } : undefined}
          />
          {formattingToolbar && <Toolbar />}
          <TableHandlesController tableHandle={TableHandleWithRemove} />
          <BlockEditorComments enabled={!!editor.comments} floatingThread={floatingThread}>
            {children}
          </BlockEditorComments>
        </BlockNoteView>
      </BlockEditorEditableContext.Provider>
    </div>
  );
};
