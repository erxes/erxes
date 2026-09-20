import {
  getBlockAttachments,
  getMentionedUserIds,
  stripHtml,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { Block } from '@blocknote/core';

import {
  hideMessageInputState,
  isInternalState,
  onlyInternalState,
} from '../states/isInternalState';
import { ComposerShell } from './ComposerShell';
import { ComposerEditor } from './ComposerEditor';
import { ComposerPreviews } from './ComposerPreviews';
import { ComposerToolbar } from './ComposerToolbar';
import type { PollDraft } from './PollComposer';
import { ResponseTemplateDropdown } from './ResponseTemplateDropdown';
import { useConversationContext } from '../hooks/useConversationContext';
import { useConversationMessageAdd } from '../hooks/useConversationMessageAdd';
import { useMessageAttachments } from '../hooks/useMessageAttachments';
import { useDiscordComposer } from '../hooks/useDiscordComposer';
import { useResponseTemplateSuggestions } from '../hooks/useResponseTemplateSuggestions';
import { messageExtraInfoState } from '../states/messageExtraInfoState';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { discordReplyToState } from '@/integrations/discord/states/discordReplyToState';
import { IntegrationType } from '@/types/Integration';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';
import {
  clearLegacyConversationDrafts,
  composerStorage,
  encodeDiscordMentions,
  getConversationDraftKey,
  parseConversationDraft,
} from '../utils/messageInput';

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
  const currentUserId = useAtomValue(currentUserState)?._id;
  const { integration } = useConversationContext();
  const [discordReplyTo, setDiscordReplyTo] = useAtom(discordReplyToState);
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const isMessenger = integration?.kind === IntegrationType.ERXES_MESSENGER;
  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [isInternalNoteCollapsed, setIsInternalNoteCollapsed] = useState(false);
  const editor = useBlockEditor();
  const draftInternalRef = useRef(false);
  const restoredDraftKeyRef = useRef<string>();
  const restoringDraftRef = useRef(false);
  const submittingRef = useRef(false);
  const activeConversationIdRef = useRef(conversationId);
  const draftKey = currentUserId
    ? getConversationDraftKey(currentUserId, conversationId)
    : null;
  const activeDraftKeyRef = useRef(draftKey);
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
    showSuggestionDropdown,
    suggestions,
  } = useResponseTemplateSuggestions({ editor, enabled: !isInternalNote });
  const {
    mentionItems: discordMentionItems,
    mentionNote: discordMentionNote,
    pingAgentTyping,
    searchMentionItems: searchDiscordMentionItems,
    stopAgentTyping,
  } = useDiscordComposer({ conversationId, isDiscord, isInternalNote });

  useLayoutEffect(() => {
    activeConversationIdRef.current = conversationId;
    activeDraftKeyRef.current = draftKey;
  }, [conversationId, draftKey]);

  useEffect(() => {
    clearLegacyConversationDrafts();
  }, []);

  useEffect(() => {
    if (!draftKey || restoredDraftKeyRef.current === draftKey) return;
    restoredDraftKeyRef.current = draftKey;
    restoringDraftRef.current = true;
    resetAttachments();
    resetSuggestions();
    setDiscordReplyTo(null);

    try {
      const draft = parseConversationDraft(composerStorage.getItem(draftKey));
      draftInternalRef.current = draft.internal ?? false;
      editor.replaceBlocks(editor.document, draft.blocks);
      setContent(draft.blocks.length ? draft.blocks : undefined);
      setIsInternalNote(draftInternalRef.current);
    } catch {
      draftInternalRef.current = false;
      composerStorage.removeItem(draftKey);
      editor.replaceBlocks(editor.document, []);
      setContent(() => undefined);
      setIsInternalNote(false);
    } finally {
      window.setTimeout(() => {
        restoringDraftRef.current = false;
      }, 0);
    }
  }, [
    draftKey,
    editor,
    resetAttachments,
    resetSuggestions,
    setDiscordReplyTo,
    setIsInternalNote,
  ]);

  useEffect(() => {
    const isLead = integration?.kind === 'lead';
    setIsInternalNoteCollapsed(false);
    setOnlyInternal(isLead);
    setIsInternalNote(isLead || draftInternalRef.current);
  }, [conversationId, integration?.kind, setIsInternalNote, setOnlyInternal]);

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleInternalNoteChange = useCallback(
    (internal: boolean) => {
      setIsInternalNoteCollapsed(false);
      setIsInternalNote(internal);
      resetSuggestions();
      setResponseTemplateId(null);
      if (content?.length && draftKey) {
        composerStorage.setItem(
          draftKey,
          JSON.stringify({ blocks: content, internal }),
        );
      }
    },
    [
      content,
      draftKey,
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

    if (nextContent && draftKey) {
      composerStorage.setItem(
        draftKey,
        JSON.stringify({ blocks, internal: isInternalNote }),
      );
    } else if (draftKey) {
      composerStorage.removeItem(draftKey);
    }
  }, [draftKey, editor, isInternalNote, pingAgentTyping, setSearchValue]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId || loading || isUploading || submittingRef.current) {
      return;
    }
    if (!content?.length && attachments.length === 0) return;
    submittingRef.current = true;
    const submittedConversationId = conversationId;
    const submittedDraftKey = draftKey;

    try {
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

      await addConversationMessage({
        variables: {
          conversationId: submittedConversationId,
          content: sendContent,
          mentionedUserIds:
            isDiscord && !isInternalNote ? [] : mentionedUserIds,
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
          if (submittedDraftKey) {
            composerStorage.removeItem(submittedDraftKey);
          }
          if (
            activeConversationIdRef.current !== submittedConversationId ||
            activeDraftKeyRef.current !== submittedDraftKey
          ) {
            return;
          }
          editor.replaceBlocks(editor.document, []);
          setContent(() => undefined);
          setMentionedUserIds([]);
          setIsInternalNote(onlyInternal);
          resetAttachments();
          resetSuggestions();
          setResponseTemplateId(null);
          setDiscordReplyTo(null);
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
    } finally {
      submittingRef.current = false;
    }
  }, [
    addConversationMessage,
    attachments,
    content,
    conversationId,
    discordReplyTo,
    draftKey,
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
    <ComposerShell
      collapsed={isInternalNoteCollapsed}
      isInternalNote={isInternalNote}
      onCollapsedChange={setIsInternalNoteCollapsed}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
    >
      <ComposerPreviews
        attachments={attachments}
        pendingAttachments={pendingAttachments}
        onRemove={removeAttachment}
      />

      {showSuggestionDropdown && !isInternalNote && (
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
            aria-label={t('cancel-reply', 'Cancel reply')}
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
    </ComposerShell>
  );
};
