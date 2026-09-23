import type {
  ChangeEvent,
  Dispatch,
  DragEvent,
  KeyboardEvent,
  SetStateAction,
} from 'react';
import type { EditorMentionItem } from 'ui-modules';
import type { DebouncedState } from 'use-debounce';
import type { IChannel } from '@/channels/types';
import type { IResponseTemplate } from '@/responseTemplate/types';
import type { usePreviousHotkeyScope } from 'erxes-ui';
import type { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import type { MessageReplyTarget } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import type { DiscordReplyTarget } from '@/integrations/discord/states/discordReplyToState';
import type { PollDraft } from '@/inbox/conversations/conversation-detail/components/PollComposer';
import type { IBlockEditor, IAttachment } from 'erxes-ui';

export type MessageInputBlocks = IBlockEditor['document'];
export type MessageInputAttachment = IAttachment;
export type MessageInputAttachmentPreview = Omit<
  MessageInputAttachment,
  'url'
> & {
  data: string;
};

export type MessageInputStateSetter<T> = Dispatch<SetStateAction<T>>;

export interface MessageInputAttachmentsResult {
  attachments: MessageInputAttachment[];
  setAttachments: MessageInputStateSetter<MessageInputAttachment[]>;
  attachmentPreview: MessageInputAttachmentPreview | null;
  setAttachmentPreview: MessageInputStateSetter<MessageInputAttachmentPreview | null>;
  isLoading: boolean;
  handleFileInput: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: DragEvent<HTMLDivElement>) => void;
  handleDeleteAttachment: (name: string) => void;
}

export interface MessageInputMentionsResult {
  discordMentionItems: EditorMentionItem[];
  searchDiscordMentionItems: (query: string) => Promise<EditorMentionItem[]>;
  discordMentionNote: string | undefined;
}

export interface MessageInputTypingResult {
  pingAgentTyping: DebouncedState<() => void>;
  stopAgentTyping: () => void;
}

export interface MessageInputTemplatesResult {
  availableChannels: IChannel[] | undefined;
  suggestions: IResponseTemplate[];
  setSuggestions: MessageInputStateSetter<IResponseTemplate[]>;
  showSuggestions: boolean;
  setShowSuggestions: MessageInputStateSetter<boolean>;
  selectedIndex: number;
  responseTemplateId: string | null;
  setResponseTemplateId: MessageInputStateSetter<string | null>;
  setSearchValue: MessageInputStateSetter<string>;
  handleTemplateSelect: (
    content: string,
    templateId?: string,
  ) => Promise<unknown>;
  handleKeyDown: (event: KeyboardEvent) => void;
}

export type MessageInputResult = MessageInputMentionsResult &
  Omit<
    MessageInputAttachmentsResult,
    'setAttachments' | 'setAttachmentPreview'
  > &
  Omit<
    MessageInputTemplatesResult,
    | 'setSuggestions'
    | 'responseTemplateId'
    | 'setResponseTemplateId'
    | 'setSearchValue'
  > &
  ReturnType<typeof usePreviousHotkeyScope> & {
    isInternalNote: boolean;
    setIsInternalNote: MessageInputStateSetter<boolean>;
    onlyInternal: boolean;
    hideInput: boolean;
    integration: ReturnType<typeof useConversationContext>['integration'];
    isDiscord: boolean;
    isMessenger: boolean;
    replyPreview: MessageReplyTarget | DiscordReplyTarget | null;
    setDiscordReplyTo: MessageInputStateSetter<DiscordReplyTarget | null>;
    setMessageReply: MessageInputStateSetter<MessageReplyTarget | null>;
    content: MessageInputBlocks | undefined;
    editor: IBlockEditor;
    loading: boolean;
    stopAgentTyping: () => void;
    handleChange: () => Promise<void>;
    handleSubmit: () => Promise<void>;
    handleSendPoll: (poll: PollDraft) => Promise<boolean>;
  };
