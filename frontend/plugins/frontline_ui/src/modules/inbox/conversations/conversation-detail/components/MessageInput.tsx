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
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Block } from '@blocknote/core';

import {
  isInternalState,
  isInternalNoteCollapsedState,
  isSlashMenuOpenState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { ComposerShell } from '@/inbox/conversations/conversation-detail/components/ComposerShell';
import { ComposerEditor } from '@/inbox/conversations/conversation-detail/components/ComposerEditor';
import { ComposerGalleries } from '@/inbox/conversations/conversation-detail/components/ComposerGalleries';
import {
  ComposerPreviews,
  ComposerReplyPreview,
} from '@/inbox/conversations/conversation-detail/components/ComposerPreviews';
import { ComposerToolbar } from '@/inbox/conversations/conversation-detail/components/ComposerToolbar';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useMessageAttachments } from '@/inbox/conversations/conversation-detail/hooks/useMessageAttachments';
import { useDiscordComposer } from '@/inbox/conversations/conversation-detail/hooks/useDiscordComposer';
import { useComposerSend } from '@/inbox/conversations/conversation-detail/hooks/useComposerSend';
import { useComposerEditorKeyDown } from '@/inbox/conversations/conversation-detail/hooks/useComposerEditorKeyDown';
import { useResponseTemplateSuggestions } from '@/inbox/conversations/conversation-detail/hooks/useResponseTemplateSuggestions';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import { IntegrationType } from '@/types/Integration';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';
import {
  clearLegacyConversationDrafts,
  composerStorage,
  getConversationDraftKey,
  parseConversationDraft,
} from '@/inbox/conversations/conversation-detail/utils/messageInput';

const NOTE_ONLY_INTEGRATION_KINDS: string[] = [
  'lead',
  IntegrationType.CALL,
  IntegrationType.CALLPRO,
  IntegrationType.MAIL,
];

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { t } = useTranslation('frontline');
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useAtom(isSlashMenuOpenState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);
  const currentUserId = useAtomValue(currentUserState)?._id;
  const { integration } = useConversationContext();
  const [replyTo, setReplyTo] = useAtom(messageReplyState);
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const isInstagram = integration?.kind === IntegrationType.INSTAGRAM_MESSENGER;
  const isMessenger = integration?.kind === IntegrationType.ERXES_MESSENGER;
  const [uploadingGalleries, setUploadingGalleries] = useState<Set<string>>(
    new Set(),
  );
  const onGalleryUploadingChange = useCallback(
    (id: string, uploading: boolean) => {
      setUploadingGalleries((current) => {
        const next = new Set(current);
        if (uploading) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [],
  );
  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const setIsInternalNoteCollapsed = useSetAtom(isInternalNoteCollapsedState);
  const editor = useBlockEditor();
  const draftInternalRef = useRef(false);
  const restoredDraftKeyRef = useRef<string>();
  const restoringDraftRef = useRef(false);
  const draftKey = currentUserId
    ? getConversationDraftKey(currentUserId, conversationId)
    : null;
  const {
    attachments,
    pendingAttachments,
    handleDrop,
    handlePaste,
    handleFileInput,
    removeAttachment,
    resetAttachments,
    retainAttachments,
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

  useEffect(() => {
    clearLegacyConversationDrafts();
  }, []);

  useEffect(() => {
    if (!draftKey || restoredDraftKeyRef.current === draftKey) return;
    restoredDraftKeyRef.current = draftKey;
    restoringDraftRef.current = true;
    resetAttachments();
    resetSuggestions();

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
  }, [draftKey, editor, resetAttachments, resetSuggestions, setIsInternalNote]);

  useEffect(() => {
    const isNoteOnly = NOTE_ONLY_INTEGRATION_KINDS.includes(
      integration?.kind ?? '',
    );
    setIsInternalNoteCollapsed(false);
    setOnlyInternal(isNoteOnly);
    setIsInternalNote(isNoteOnly || draftInternalRef.current);
  }, [
    conversationId,
    integration?.kind,
    setIsInternalNote,
    setIsInternalNoteCollapsed,
    setOnlyInternal,
  ]);

  useEffect(() => {
    if (replyTo && !onlyInternal) {
      setIsInternalNote(false);
      setIsInternalNoteCollapsed(false);
    }
  }, [replyTo, onlyInternal, setIsInternalNote, setIsInternalNoteCollapsed]);

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
      setIsInternalNoteCollapsed,
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

  const resetComposer = useCallback(() => {
    editor.replaceBlocks(editor.document, []);
    setContent(() => undefined);
    setMentionedUserIds([]);
    setIsInternalNote(onlyInternal);
    resetAttachments();
    resetSuggestions();
    setResponseTemplateId(null);
    setReplyTo(null);
  }, [
    editor,
    onlyInternal,
    resetAttachments,
    resetSuggestions,
    setIsInternalNote,
    setReplyTo,
    setResponseTemplateId,
  ]);

  const handlePartialDelivery = useCallback(
    (remainingAttachments: typeof attachments) => {
      resetComposer();
      retainAttachments(remainingAttachments);
    },
    [resetComposer, retainAttachments],
  );

  const { handleSubmit, handleSendPoll, loading } = useComposerSend({
    conversationId,
    draftKey,
    editor,
    content,
    attachments,
    mentionedUserIds,
    isDiscord,
    isInstagram,
    isFacebook: integration?.kind === IntegrationType.FACEBOOK_MESSENGER,
    isInternalNote,
    isUploading: isUploading || uploadingGalleries.size > 0,
    responseTemplateId,
    resetComposer,
    onPartialDelivery: handlePartialDelivery,
  });

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

  const editorRef = useComposerEditorKeyDown({
    editor,
    isInternalNote,
    isSlashMenuOpen,
    isUploading: isUploading || uploadingGalleries.size > 0,
    loading,
    onlyInternal,
    showSuggestions,
    onInternalNoteChange: handleInternalNoteChange,
    onSuggestionKeyDown: handleKeyDown,
  });

  useEffect(() => {
    const unsubscribe = editor.suggestionMenus.onUpdate('/', (state) => {
      setIsSlashMenuOpen(state.show);
    });

    return () => {
      unsubscribe();
      setIsSlashMenuOpen(false);
    };
  }, [editor, setIsSlashMenuOpen]);

  const sendDisabled =
    loading ||
    isUploading ||
    uploadingGalleries.size > 0 ||
    (!content?.length && attachments.length === 0);
  const blockAttachments = getBlockAttachments(
    editor.document.filter((block) => block.type !== 'gallery'),
  );

  return (
    <ComposerShell
      onDrop={handleDrop}
      disabled={loading || isUploading || uploadingGalleries.size > 0}
      onInternalNoteChange={handleInternalNoteChange}
      replyPreview={
        !isInternalNote && replyTo ? (
          <ComposerReplyPreview
            replyTo={replyTo}
            onCancel={() => setReplyTo(null)}
          />
        ) : null
      }
    >
      <div
        data-composer-previews
        className="flex max-h-24 shrink-0 flex-wrap items-center gap-2 overflow-y-auto overscroll-contain border-b border-border/50 p-2 empty:hidden sm:px-3"
      >
        <ComposerGalleries
          editor={editor}
          disabled={loading || isUploading}
          onUploadingChange={onGalleryUploadingChange}
        />
        <ComposerPreviews
          attachments={attachments}
          blockAttachments={blockAttachments}
          pendingAttachments={pendingAttachments}
          onRemove={removeAttachment}
          onRemoveBlockAttachment={removeBlockAttachment}
        />
      </div>
      <div
        data-composer-scroll
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {showSuggestions && !isInternalNote && (
          <ResponseTemplateDropdown
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            availableChannels={availableChannels}
            loading={suggestionsLoading}
            onSelect={selectTemplate}
          />
        )}

        <div
          ref={editorRef}
          data-composer-editor
          onPasteCapture={handlePaste}
          className="min-h-12 min-w-0 [&_.bn-container>div]:max-w-full [&_.bn-container_.w-72]:max-w-full"
        >
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
      </div>

      <ComposerToolbar
        conversationId={conversationId}
        integrationChannelId={integration?.channelId}
        isDiscord={isDiscord}
        isMessenger={isMessenger}
        isInternalNote={isInternalNote}
        isUploading={isUploading || uploadingGalleries.size > 0}
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
