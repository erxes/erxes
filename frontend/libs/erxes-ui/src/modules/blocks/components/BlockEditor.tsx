import {
  createReactInlineContentSpec,
  SuggestionMenuController,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';

import { Button, Tooltip } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import 'erxes-ui/modules/blocks/styles/styles.css';
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

  return (
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
      data-state={focus ? 'focus' : 'blur'}
      className={cn(
        variant === 'outline' &&
          'shadow-xs transition-[color,box-shadow] data-[state=focus]:shadow-focus',
        className,
      )}
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
        suggestionMenuComponent={SlashMenu}
      />
      <Toolbar />
      {children}
    </BlockNoteView>
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
