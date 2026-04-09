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
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { BlockEditorProps } from '../types';
import { SlashMenu } from './SlashMenu';
import { Toolbar } from './Toolbar';

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
}: BlockEditorProps) => {
  const theme = useAtomValue(themeState);
  const [focus, setFocus] = useState(false);

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
          const insertedBlock = editor.insertBlocks([{ type: 'image' }], currentBlock, 'after')[0];

          editor.transact((tr) =>
            tr.setMeta(editor.filePanel!.plugins[0], {
              block: insertedBlock,
            }),
          );
        },
      } satisfies DefaultReactSuggestionItem);
    }

    return Promise.resolve(filterSuggestionItems(items, query));
  };

  return (
    <div
      className={cn(
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
