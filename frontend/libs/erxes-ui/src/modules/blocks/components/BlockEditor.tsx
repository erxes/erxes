import { KeyboardEvent, MouseEvent, useRef, useState } from 'react';
import {
  SuggestionMenuController,
  TableHandlesController,
  createReactInlineContentSpec,
} from '@blocknote/react';

import { BarcodeAttribute } from 'erxes-ui/modules/blocks/components/BarcodeAttribute';
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
  additionalSlashMenuItems,
}: BlockEditorProps) => {
  const theme = useAtomValue(themeState);
  const [focus, setFocus] = useState(false);
  const deletingText = useRef(false);

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
        {children}
      </BlockNoteView>
    </div>
  );
};

export const Mention = createReactInlineContentSpec(
  {
    type: 'mention',
    propSchema: {
      fullName: {
        default: 'Unknown',
      },
      _id: {
        default: '',
      },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <span className="bg-primary/10 p-1 rounded font-bold text-sm text-primary inline-flex items-center">
        @{props.inlineContent.props.fullName}
      </span>
    ),
  },
);

export const Attribute = createReactInlineContentSpec(
  {
    type: 'attribute',
    propSchema: {
      name: {
        default: 'Unknown',
      },
      value: {
        default: '',
      },
      width: {
        default: 150,
      },
      height: {
        default: 50,
      },
    },
    content: 'none',
  },
  {
    render: (props) =>
      props.inlineContent.props.value === 'barcode' ? (
        <BarcodeAttribute
          editable={props.editor.isEditable}
          height={props.inlineContent.props.height}
          width={props.inlineContent.props.width}
          onResize={({ width, height }) =>
            props.updateInlineContent({
              type: 'attribute',
              props: { ...props.inlineContent.props, width, height },
            })
          }
        />
      ) : (
        <span className="bg-yellow-50 p-1 rounded font-bold text-sm text-yellow-900 inline-flex items-center">
          {props.inlineContent.props.name}
        </span>
      ),
  },
);
