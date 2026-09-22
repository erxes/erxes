import {
  getBlockAttachments,
  getMentionedUserIds,
  stripHtml,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
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
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { ComposerShell } from '@/inbox/conversations/conversation-detail/components/ComposerShell';
import { ComposerEditor } from '@/inbox/conversations/conversation-detail/components/ComposerEditor';
import { ComposerPreviews } from '@/inbox/conversations/conversation-detail/components/ComposerPreviews';
import { ComposerToolbar } from '@/inbox/conversations/conversation-detail/components/ComposerToolbar';
import type { PollDraft } from '@/inbox/conversations/conversation-detail/components/PollComposer';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageAdd } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageAdd';
import { useMessageAttachments } from '@/inbox/conversations/conversation-detail/hooks/useMessageAttachments';
import { useDiscordComposer } from '@/inbox/conversations/conversation-detail/hooks/useDiscordComposer';
import { useResponseTemplateSuggestions } from '@/inbox/conversations/conversation-detail/hooks/useResponseTemplateSuggestions';
import { messageExtraInfoState } from '@/inbox/conversations/conversation-detail/states/messageExtraInfoState';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import { IntegrationType } from '@/types/Integration';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';
import {
  clearLegacyConversationDrafts,
  composerStorage,
  encodeDiscordMentions,
  escapeComposerQuote,
  getConversationDraftKey,
  parseConversationDraft,
} from '@/inbox/conversations/conversation-detail/utils/messageInput';

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
  const [replyTo, setReplyTo] = useAtom(messageReplyState);
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
    showSuggestions,
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
    setReplyTo(null);

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
    setIsInternalNote,
    setReplyTo,
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
      const quotedContent =
        replyTo && !replyTo.nativeReply && !isInternalNote
          ? `<blockquote><strong>Replying to</strong><br/>${escapeComposerQuote(
              replyTo.preview,
            )}</blockquote>`
          : '';
      const blockAttachments = getBlockAttachments(content || []);
      const attachmentUrls = new Set(attachments.map(({ url }) => url));
      const allAttachments = [
        ...attachments,
        ...blockAttachments.filter(({ url }) => !attachmentUrls.has(url)),
      ];

      await addConversationMessage({
        variables: {
          conversationId: submittedConversationId,
          content: `${quotedContent}${sendContent || ''}`,
          mentionedUserIds:
            isDiscord && !isInternalNote ? [] : mentionedUserIds,
          internal: isInternalNote,
          extraInfo: messageExtraInfo,
          attachments: allAttachments,
          responseTemplateId,
          ...(!isInternalNote &&
          replyTo?.nativeReply &&
          replyTo.providerMessageId
            ? { replyToMessageId: replyTo.providerMessageId }
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
          setReplyTo(null);
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
    draftKey,
    editor,
    isDiscord,
    isInternalNote,
    isUploading,
    loading,
    mentionedUserIds,
    messageExtraInfo,
    onlyInternal,
    replyTo,
    resetAttachments,
    resetSuggestions,
    responseTemplateId,
    setIsInternalNote,
    setReplyTo,
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

  const removeBlockAttachment = useCallback(
    (url: string) => {
      const mediaTypes = new Set(['image', 'video', 'audio', 'file']);
      const blocks = editor.document.filter((block) => {
        const props = block.props as { url?: string };

        return mediaTypes.has(block.type) && props.url === url;
      });

      if (!blocks.length) return;

      editor.removeBlocks(blocks);
      toast({ title: t('attachment-removed', 'Attachment removed') });
    },
    [editor, t],
  );

  /*
   * The keys that drive the template suggestions are listened for on the
   * editor node rather than on the form: only the editor takes focus,
   * and the form is a drop target with no keyboard role of its own.
   */
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = editorRef.current;

    if (!node) {
      return undefined;
    }

    node.addEventListener('keydown', handleKeyDown);

    return () => {
      node.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (hideInput) return null;

  const sendDisabled =
    loading ||
    isUploading ||
    pendingAttachments.length > 0 ||
    (!content?.length && attachments.length === 0);
  const blockAttachments = getBlockAttachments(content || []);

  return (
    <ComposerShell
      collapsed={isInternalNoteCollapsed}
      disabled={loading || isUploading}
      isInternalNote={isInternalNote}
      onlyInternal={onlyInternal}
      onCollapsedChange={setIsInternalNoteCollapsed}
      onDrop={handleDrop}
      onInternalNoteChange={handleInternalNoteChange}
    >
      <ComposerPreviews
        attachments={attachments}
        blockAttachments={blockAttachments}
        pendingAttachments={pendingAttachments}
        replyTo={isInternalNote ? null : replyTo}
        onRemove={removeAttachment}
        onRemoveBlockAttachment={removeBlockAttachment}
        onCancelReply={() => setReplyTo(null)}
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

      <div ref={editorRef}>
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
      </div>

      <ComposerToolbar
        conversationId={conversationId}
        integrationChannelId={integration?.channelId}
        isDiscord={isDiscord}
        isMessenger={isMessenger}
        isInternalNote={isInternalNote}
        isUploading={isUploading}
        loading={loading}
        sendDisabled={sendDisabled}
        onFilesSelected={handleFileInput}
        onTemplateSelect={selectTemplate}
        onSendPoll={handleSendPoll}
        onSubmit={handleSubmit}
      />
    </ComposerShell>
  );
};
