import type { ChangeEvent } from 'react';
import type { EditorMentionItem } from 'ui-modules';
import type { ComposerBlockEditor } from '@/inbox/conversations/conversation-detail/types/composer';
import type { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import type { PollDraft } from '@/inbox/conversations/conversation-detail/components/PollComposer';

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
  onFilesSelected: (event: ChangeEvent<HTMLInputElement>) => void;
  onTemplateSelect: (content: string, templateId?: string) => void;
  onSendPoll: (poll: PollDraft) => Promise<boolean>;
  onSubmit: () => void;
};

export type ComposerModeTabsProps = {
  isInternalNote: boolean;
  disabled: boolean;
  replyDisabled?: boolean;
  onInternalNoteChange: (internal: boolean) => void;
};
