import {
  createReactInlineContentSpec,
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from '@blocknote/react';
import { filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/shadcn';

import { Button, Tooltip } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import { themeState } from 'erxes-ui/state';
import { IconPhoto } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { KeyboardEvent, useEffect, useState } from 'react';
import { BlockEditorProps } from '../types';
import { SlashMenu } from './SlashMenu';
import { Toolbar } from './Toolbar';

const EDITOR_OVERRIDE_STYLE_ID = 'erxes-blocknote-media-overrides';

const EDITOR_OVERRIDE_CSS = `
.erxes-blocknote [data-file-block] .bn-add-file-button{
  display: flex;
  width: 100%;
  min-height: 84px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px;
  background-color: hsl(var(--muted) / 0.4);
  border: 1px dashed hsl(var(--border));
  border-radius: 12px;
  color: hsl(var(--muted-foreground));
  transition: background-color .15s ease, border-color .15s ease, color .15s ease;
}
.erxes-blocknote [data-file-block] .bn-add-file-button:hover{
  background-color: hsl(var(--muted));
  border-color: hsl(var(--primary) / 0.5);
  color: hsl(var(--foreground));
}
.erxes-blocknote [data-file-block] .bn-add-file-button-icon{
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}
.erxes-blocknote [data-file-block] .bn-add-file-button-icon svg{
  width: 20px;
  height: 20px;
}
.erxes-blocknote [data-file-block] .bn-add-file-button-text{
  font-size: 13px;
  font-weight: 500;
}
.erxes-blocknote [data-file-block] .bn-file-loading-preview{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 84px;
  gap: 10px;
  border-radius: 12px;
  background-color: hsl(var(--muted) / 0.4);
  border: 1px dashed hsl(var(--border));
}
.erxes-blocknote [data-file-block] .bn-visual-media-wrapper{
  overflow: hidden;
  border-radius: 12px;
}
.erxes-blocknote [data-file-block] .bn-visual-media{
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
}
.erxes-blocknote [data-file-block] .bn-file-name-with-icon{
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background-color: hsl(var(--muted) / 0.4);
  border: 1px solid hsl(var(--border));
}
`;

const isEmptyBlock = (block?: any) =>
  !!block &&
  Array.isArray(block.content) &&
  !block.content.length &&
  !block.children?.length;

export const BlockEditor = ({
  editor,
  onFocus,
  onBlur,
  onPaste,
  onChange,
  readonly,
  children,
  className,
  style,
  disabled,
  variant = 'default',
  sideMenu = false,
  linkToolbar = true,
  additionalSlashMenuItems,
}: BlockEditorProps) => {
  const theme = useAtomValue(themeState);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const existing = document.getElementById(EDITOR_OVERRIDE_STYLE_ID);
    if (!existing) {
      const styleEl = document.createElement('style');
      styleEl.id = EDITOR_OVERRIDE_STYLE_ID;
      styleEl.textContent = EDITOR_OVERRIDE_CSS;
      document.head.appendChild(styleEl);
    }
  }, []);

  const getSlashMenuItems = (query: string) => {
    const items = getDefaultReactSlashMenuItems(editor);
    const hasImageItem = items.some((item) => item.title === 'Image');
    const hasCustomImageBlock = 'image' in editor.schema.blockSchema;

    if (!hasImageItem && hasCustomImageBlock) {
      items.splice(9, 0, {
        title: editor.dictionary.slash_menu.image.title,
        subtext: editor.dictionary.slash_menu.image.subtext,
        aliases: editor.dictionary.slash_menu.image.aliases,
        badge: undefined,
        group: editor.dictionary.slash_menu.image.group,
        onItemClick: () => {
          const currentBlock = editor.getTextCursorPosition().block;
          const insertedBlock = editor.insertBlocks(
            [{ type: 'image' }],
            currentBlock,
            'after',
          )[0];

          editor.transact((tr) =>
            tr.setMeta(editor.filePanel!.plugins[0], {
              block: insertedBlock,
            }),
          );
        },
      } satisfies DefaultReactSuggestionItem);
    }

    if ('gallery' in editor.schema.blockSchema) {
      items.push({
        title: 'Gallery',
        subtext: 'Insert a multi-image gallery grid',
        aliases: ['gallery', 'images', 'grid'],
        badge: undefined,
        group: editor.dictionary.slash_menu.image.group,
        icon: <IconPhoto size={18} />,
        onItemClick: () => {
          const currentBlock = editor.getTextCursorPosition().block;
          editor.insertBlocks(
            [{ type: 'gallery' as any }],
            currentBlock,
            'after',
          );
        },
      } satisfies DefaultReactSuggestionItem);
    }

    const customItems =
      typeof additionalSlashMenuItems === 'function'
        ? additionalSlashMenuItems(editor)
        : additionalSlashMenuItems;

    if (customItems?.length) {
      items.push(...customItems);
    }

    return Promise.resolve(filterSuggestionItems(items, query));
  };

  const handleKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
    if (readonly || disabled || (e.key !== 'Backspace' && e.key !== 'Delete')) {
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
        shadCNComponents={{
          Button: { Button },
          Tooltip: {
            Tooltip,
            TooltipContent: Tooltip.Content,
            TooltipProvider: Tooltip.Provider,
            TooltipTrigger: Tooltip.Trigger,
          },
        }}
        style={style}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={getSlashMenuItems}
          suggestionMenuComponent={SlashMenu}
          floatingOptions={{ placement: 'top-start' }}
        />
        <Toolbar />
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
    },
    content: 'none',
  },
  {
    render: (props) => (
      <span className="bg-yellow-50 p-1 rounded font-bold text-sm text-yellow-900 inline-flex items-center">
        {props.inlineContent.props.name}
      </span>
    ),
  },
);
