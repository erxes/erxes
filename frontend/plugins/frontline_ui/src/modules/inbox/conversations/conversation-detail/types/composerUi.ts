import type { DragEventHandler, ReactNode } from 'react';
import type { EditorMentionItem } from 'ui-modules';
import type { ComposerBlockEditor } from './composer';
import type { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import type { PollDraft } from '@/inbox/conversations/conversation-detail/components/composer/PollComposer';

export type ComposerEditorProps = {
  editor: ComposerBlockEditor;
  isDiscord: boolean;
  isInternalNote: boolean;
  loading: boolean;
  discordMentionItems: EditorMentionItem[];
  discordMentionNote?: string;
  searchDiscordMentionItems: (query: string) => Promise<EditorMentionItem[]>;
  onChange: () => void;
  onFocus: (scope: InboxHotkeyScope) => void;
  onBlur: () => void;
};

export type ComposerToolbarProps = {
  conversationId: string;
  integrationChannelId?: string;
  isDiscord: boolean;
  isTelegram?: boolean;
  isMessenger: boolean;
  isInternalNote: boolean;
  isUploading: boolean;
  loading: boolean;
  sendDisabled: boolean;
  onFilesSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTemplateSelect: (content: string, templateId?: string) => void;
  onSendPoll: (poll: PollDraft) => Promise<boolean>;
  onSubmit: () => void;
};

export type ComposerShellProps = {
  children: ReactNode;
  replyPreview?: ReactNode;
  disabled: boolean;
  onDrop: DragEventHandler<HTMLFormElement>;
  onInternalNoteChange: (internal: boolean) => void;
};

export type ComposerModeTabsProps = {
  isInternalNote: boolean;
  disabled: boolean;
  replyDisabled?: boolean;
  onInternalNoteChange: (internal: boolean) => void;
};

export type ComposerShellHeaderProps = Pick<
  ComposerShellProps,
  'disabled' | 'onInternalNoteChange' | 'replyPreview'
> & {
  noteOnly: boolean;
  isInternalNote: boolean;
  onlyInternal: boolean;
  onCollapse: () => void;
};

export type ComposerShellState = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isInternalNote: boolean;
  onlyInternal: boolean;
  noteOnly: boolean;
};
