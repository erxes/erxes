import {
  cn,
  getBlockAttachments,
  getMentionedUserIds,
  stripHtml,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { IconLock, IconMessage2, IconX } from '@tabler/icons-react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useThrottledCallback } from 'use-debounce';
import { useMutation } from '@apollo/client';
import type { Block } from '@blocknote/core';
import type { EditorMentionItem } from 'ui-modules';

import {
  hideMessageInputState,
  isInternalState,
  onlyInternalState,
} from '../states/isInternalState';
import { CONVERSATION_AGENT_TYPING } from '../graphql/mutations/conversationAgentTyping';
import { ComposerEditor } from './ComposerEditor';
import { ComposerPreviews } from './ComposerPreviews';
import { ComposerToolbar } from './ComposerToolbar';
import type { PollDraft } from './PollComposer';
import { ResponseTemplateDropdown } from './ResponseTemplateDropdown';
import { useConversationContext } from '../hooks/useConversationContext';
import { useConversationMessageAdd } from '../hooks/useConversationMessageAdd';
import { useMessageAttachments } from '../hooks/useMessageAttachments';
import { useResponseTemplateSuggestions } from '../hooks/useResponseTemplateSuggestions';
import { messageExtraInfoState } from '../states/messageExtraInfoState';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import {
  useDiscordChannelMemberSearch,
  useDiscordConversationParticipants,
} from '@/integrations/discord/hooks/useDiscordSetup';
import { discordReplyToState } from '@/integrations/discord/states/discordReplyToState';
import { IntegrationType } from '@/types/Integration';
import { useTranslation } from 'react-i18next';

const draftKey = (conversationId: string) =>
  `frontline:conversation-draft:${conversationId}`;

const encodeDiscordMentions = (blocks?: Block[]): Block[] | undefined =>
  blocks?.map((block) =>
    Array.isArray(block.content)
      ? ({
          ...block,
          content: block.content.map(
            (inline: { type?: string; props?: { _id?: string } }) =>
              inline.type === 'mention'
                ? {
                    type: 'text',
                    text: `{@discord:${inline.props?._id}}`,
                    styles: {},
                  }
                : inline,
          ),
        } as Block)
      : block,
  );

type ConversationDraft = {
  blocks: Block[];
  internal?: boolean;
};

const parseConversationDraft = (stored: string | null): ConversationDraft => {
  if (!stored) return { blocks: [] };

  const parsed: unknown = JSON.parse(stored);
  if (Array.isArray(parsed)) return { blocks: parsed as Block[] };
  if (!parsed || typeof parsed !== 'object') return { blocks: [] };

  const draft = parsed as Record<string, unknown>;
  return {
    blocks: Array.isArray(draft.blocks) ? (draft.blocks as Block[]) : [],
    internal: typeof draft.internal === 'boolean' ? draft.internal : undefined,
  };
};

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { t } = useTranslation('frontline');
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);
  const hideInput = useAtomValue(hideMessageInputState);
  const messageExtraInfo = useAtomValue(messageExtraInfoState);
  const { integration } = useConversationContext();
  const [discordReplyTo, setDiscordReplyTo] = useAtom(discordReplyToState);
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const isMessenger = integration?.kind === IntegrationType.ERXES_MESSENGER;
  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const editor = useBlockEditor();
  const restoringDraftRef = useRef(false);
  const { addConversationMessage, loading } = useConversationMessageAdd();
  const {
    attachments,
    pendingAttachments,
    handleDrop,
    handleFileInput,
    removeAttachment,
    resetAttachments,
    isUploading,
  } = useMessageAttachments(isDiscord);
  const {
    availableChannels,
    handleKeyDown,
    isLoading: suggestionsLoading,
    resetSuggestions,
    responseTemplateId,
    selectedIndex,
    selectTemplate,
    setResponseTemplateId,
    setSearchValue,
    showSuggestions,
    suggestions,
  } = useResponseTemplateSuggestions({ editor, enabled: !isInternalNote });

  const discordParticipants = useDiscordConversationParticipants(
    conversationId,
    !isDiscord || !conversationId,
  );
  const { search: searchDiscordMembers, status: discordMemberStatus } =
    useDiscordChannelMemberSearch(
      conversationId,
      !isDiscord || !conversationId,
    );
  const discordMentionItems = useMemo<EditorMentionItem[]>(() => {
    const byUserId = new Map<string, EditorMentionItem>();
    for (const person of discordParticipants) {
      if (person.userId && !byUserId.has(person.userId)) {
        byUserId.set(person.userId, {
          id: person.userId,
          fullName: person.name || 'Discord user',
          avatar: person.avatar,
        });
      }
    }
    return [...byUserId.values()];
  }, [discordParticipants]);
  const searchDiscordMentionItems = useCallback(
    async (query: string): Promise<EditorMentionItem[]> => {
      const found = await searchDiscordMembers(query);

      return found
        .filter((person) => person.userId)
        .map((person) => ({
          id: person.userId,
          fullName: person.name || 'Discord user',
          avatar: person.avatar,
        }));
    },
    [searchDiscordMembers],
  );
  const discordMentionNote = useMemo(() => {
    switch (discordMemberStatus) {
      case 'TRUNCATED':
        return 'Too many matches — keep typing to narrow down';
      case 'FORBIDDEN':
        return 'Bot cannot read this channel — showing people who have chatted';
      case 'ERROR':
        return 'Member search unavailable — showing people who have chatted';
      default:
        return undefined;
    }
  }, [discordMemberStatus]);

  useEffect(() => {
    const isLead = integration?.kind === 'lead';
    setOnlyInternal(isLead);
    setIsInternalNote(isLead);
  }, [conversationId, integration?.kind, setIsInternalNote, setOnlyInternal]);

  useEffect(() => {
    restoringDraftRef.current = true;
    resetAttachments();
    resetSuggestions();
    setDiscordReplyTo(null);

    try {
      const draft = parseConversationDraft(
        window.localStorage.getItem(draftKey(conversationId)),
      );
      editor.replaceBlocks(editor.document, draft.blocks);
      setContent(draft.blocks.length ? draft.blocks : undefined);
      if (draft.internal !== undefined && !onlyInternal) {
        setIsInternalNote(draft.internal);
      }
    } catch {
      window.localStorage.removeItem(draftKey(conversationId));
      editor.replaceBlocks(editor.document, []);
      setContent();
    } finally {
      window.setTimeout(() => {
        restoringDraftRef.current = false;
      }, 0);
    }
  }, [
    conversationId,
    editor,
    integration?.kind,
    onlyInternal,
    resetAttachments,
    resetSuggestions,
    setDiscordReplyTo,
    setIsInternalNote,
  ]);

  const [notifyAgentTyping] = useMutation(CONVERSATION_AGENT_TYPING);
  const pingAgentTyping = useThrottledCallback(
    () => {
      if (isDiscord && !isInternalNote && conversationId) {
        notifyAgentTyping({
          variables: { conversationId, typing: true },
        }).catch(() => undefined);
      }
    },
    10000,
    { leading: true, trailing: false },
  );
  const stopAgentTyping = useCallback(() => {
    pingAgentTyping.cancel();
    if (isDiscord && conversationId) {
      notifyAgentTyping({
        variables: { conversationId, typing: false },
      }).catch(() => undefined);
    }
  }, [conversationId, isDiscord, notifyAgentTyping, pingAgentTyping]);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleInternalNoteChange = useCallback(
    (internal: boolean) => {
      setIsInternalNote(internal);
      resetSuggestions();
      setResponseTemplateId(null);
      if (content?.length) {
        window.localStorage.setItem(
          draftKey(conversationId),
          JSON.stringify({ blocks: content, internal }),
        );
      }
    },
    [
      content,
      conversationId,
      resetSuggestions,
      setIsInternalNote,
      setResponseTemplateId,
    ],
  );

  const handleChange = useCallback(async () => {
    if (restoringDraftRef.current) return;

    const blocks = editor.document as Block[];
    const html = await editor.blocksToHTMLLossy(blocks);
    const plain = stripHtml(html).trim();
    const hasBlockAttachments = getBlockAttachments(blocks).length > 0;
    const nextContent = plain || hasBlockAttachments ? blocks : undefined;

    setContent(nextContent);
    setSearchValue(plain);
    if (plain) pingAgentTyping();
    setMentionedUserIds(getMentionedUserIds(blocks));

    if (nextContent) {
      window.localStorage.setItem(
        draftKey(conversationId),
        JSON.stringify({ blocks, internal: isInternalNote }),
      );
    } else {
      window.localStorage.removeItem(draftKey(conversationId));
    }
  }, [conversationId, editor, isInternalNote, pingAgentTyping, setSearchValue]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId || loading || isUploading) return;
    if (!content?.length && attachments.length === 0) return;

    const outgoingBlocks =
      isDiscord && !isInternalNote ? encodeDiscordMentions(content) : content;
    const sendContent = isInternalNote
      ? JSON.stringify(content || [])
      : await editor.blocksToHTMLLossy(outgoingBlocks || []);
    const blockAttachments = getBlockAttachments(content || []);
    const attachmentUrls = new Set(attachments.map(({ url }) => url));
    const allAttachments = [
      ...attachments,
      ...blockAttachments.filter(({ url }) => !attachmentUrls.has(url)),
    ];

    addConversationMessage({
      variables: {
        conversationId,
        content: sendContent,
        mentionedUserIds: isDiscord && !isInternalNote ? [] : mentionedUserIds,
        internal: isInternalNote,
        extraInfo: messageExtraInfo,
        attachments: allAttachments,
        responseTemplateId,
        ...(isDiscord && !isInternalNote && discordReplyTo
          ? { replyToMessageId: discordReplyTo.messageId }
          : {}),
      },
      onCompleted: () => {
        toast({
          title: isInternalNote
            ? t('note-added', 'Internal note added')
            : t('message-sent', 'Message sent!'),
        });
        editor.replaceBlocks(editor.document, []);
        setContent(undefined);
        setMentionedUserIds([]);
        setIsInternalNote(onlyInternal);
        resetAttachments();
        resetSuggestions();
        setResponseTemplateId(null);
        setDiscordReplyTo(null);
        window.localStorage.removeItem(draftKey(conversationId));
      },
      refetchQueries: [
        'Conversations',
        'ConversationMessages',
        'ConversationCounts',
        'FrontlineInboxSidebarWorkCounts',
      ],
      onError: (error) =>
        toast({
          title: t('failed-to-send', 'Failed to send'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  }, [
    addConversationMessage,
    attachments,
    content,
    conversationId,
    discordReplyTo,
    editor,
    isDiscord,
    isInternalNote,
    isUploading,
    loading,
    mentionedUserIds,
    messageExtraInfo,
    onlyInternal,
    resetAttachments,
    resetSuggestions,
    responseTemplateId,
    setDiscordReplyTo,
    setIsInternalNote,
    setResponseTemplateId,
    t,
  ]);

  const handleSendPoll = useCallback(
    async (poll: PollDraft): Promise<boolean> => {
      if (!conversationId) return false;
      try {
        await addConversationMessage({
          variables: { conversationId, content: '', internal: false, poll },
          refetchQueries: [
            'Conversations',
            'ConversationMessages',
            'ConversationCounts',
            'FrontlineInboxSidebarWorkCounts',
          ],
        });
        toast({ title: t('poll-sent', 'Poll sent!') });
        return true;
      } catch (error) {
        toast({
          title: t('failed-to-send-poll', 'Failed to send poll'),
          description: (error as Error).message,
          variant: 'destructive',
        });
        return false;
      }
    },
    [addConversationMessage, conversationId, t],
  );

  useScopedHotkeys('mod+enter', handleSubmit, InboxHotkeyScope.MessageInput);

  if (hideInput) return null;

  const sendDisabled =
    loading ||
    isUploading ||
    pendingAttachments.length > 0 ||
    (!content?.length && attachments.length === 0);

  return (
    <div className="h-full p-2">
      <div
        onDropCapture={handleDrop}
        onKeyDown={handleKeyDown}
        onDragOverCapture={(event) => event.preventDefault()}
        className={cn(
          'mx-auto flex h-full max-w-2xl flex-col gap-1 overflow-hidden rounded-xl border border-border/70 bg-sidebar py-2 shadow-xs transition-colors duration-150',
          isInternalNote && 'border-warning/50 bg-warning/20',
        )}
      >
        <output className="flex flex-none items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground">
          {isInternalNote ? (
            <IconLock className="size-3.5" />
          ) : (
            <IconMessage2 className="size-3.5" />
          )}
          {isInternalNote
            ? t('note-visibility', 'Internal note - only visible to your team')
            : t('reply-visibility', 'Reply - sent to the customer')}
        </output>

        <ComposerPreviews
          attachments={attachments}
          pendingAttachments={pendingAttachments}
          onRemove={removeAttachment}
        />

        {showSuggestions && !isInternalNote && (
          <ResponseTemplateDropdown
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            availableChannels={availableChannels}
            loading={suggestionsLoading}
            onSelect={selectTemplate}
          />
        )}

        {isDiscord && !isInternalNote && discordReplyTo && (
          <div className="mx-3 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            <span className="truncate">
              {t('replying-to', 'Replying to:')} {discordReplyTo.preview}
            </span>
            <button
              type="button"
              aria-label="Cancel reply"
              onClick={() => setDiscordReplyTo(null)}
              className="flex-none hover:text-foreground"
            >
              <IconX className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        <ComposerEditor
          editor={editor}
          isDiscord={isDiscord}
          isInternalNote={isInternalNote}
          loading={loading}
          discordMentionItems={discordMentionItems}
          discordMentionNote={discordMentionNote}
          searchDiscordMentionItems={searchDiscordMentionItems}
          onChange={handleChange}
          onFocus={setHotkeyScopeAndMemorizePreviousScope}
          onBlur={() => {
            goBackToPreviousHotkeyScope();
            stopAgentTyping();
          }}
        />

        <ComposerToolbar
          conversationId={conversationId}
          integrationChannelId={integration?.channelId}
          isDiscord={isDiscord}
          isMessenger={isMessenger}
          isInternalNote={isInternalNote}
          onlyInternal={onlyInternal}
          isUploading={isUploading}
          loading={loading}
          sendDisabled={sendDisabled}
          onInternalNoteChange={handleInternalNoteChange}
          onFilesSelected={handleFileInput}
          onTemplateSelect={selectTemplate}
          onSendPoll={handleSendPoll}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
