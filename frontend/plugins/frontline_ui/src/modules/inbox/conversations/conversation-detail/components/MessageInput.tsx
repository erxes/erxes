import {
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

import {
  isInternalState,
  isSlashMenuOpenState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { ComposerShell } from '@/inbox/conversations/conversation-detail/components/composer/ComposerShell';
import { ComposerEditor } from '@/inbox/conversations/conversation-detail/components/composer/ComposerEditor';
import { ComposerGalleries } from '@/inbox/conversations/conversation-detail/components/composer/ComposerGalleries';
import { ComposerPreviews } from '@/inbox/conversations/conversation-detail/components/composer/ComposerPreviews';
import { ComposerReplyPreview } from '@/inbox/conversations/conversation-detail/components/composer/ComposerReplyPreview';
import { ComposerToolbar } from '@/inbox/conversations/conversation-detail/components/composer/ComposerToolbar';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useMessageAttachments } from '@/inbox/conversations/conversation-detail/hooks/useMessageAttachments';
import { useDiscordComposer } from '@/inbox/conversations/conversation-detail/hooks/useDiscordComposer';
import { useComposerSend } from '@/inbox/conversations/conversation-detail/hooks/composer/useComposerSend';
import { useComposerEditorKeyDown } from '@/inbox/conversations/conversation-detail/hooks/composer/useComposerEditorKeyDown';
import { useResponseTemplateSuggestions } from '@/inbox/conversations/conversation-detail/hooks/useResponseTemplateSuggestions';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import { IntegrationType } from '@/types/Integration';
import { useComposerDraft } from '@/inbox/conversations/conversation-detail/hooks/composer/useComposerDraft';
import { useComposerAttachments } from '@/inbox/conversations/conversation-detail/hooks/composer/useComposerAttachments';

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const isInternalNote = useAtomValue(isInternalState);
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useAtom(isSlashMenuOpenState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const { integration } = useConversationContext();
  const [replyTo, setReplyTo] = useAtom(messageReplyState);
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const isTelegram = integration?.kind === IntegrationType.TELEGRAM_MESSENGER;
  const isInstagram = integration?.kind === IntegrationType.INSTAGRAM_MESSENGER;
  const isMessenger = integration?.kind === IntegrationType.ERXES_MESSENGER;
  const editor = useBlockEditor();
  const {
    blockAttachments,
    removeBlockAttachment,
    isGalleryUploading,
    onGalleryUploadingChange,
  } = useComposerAttachments(editor);
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
  } = useMessageAttachments(isDiscord, isTelegram);
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
  } = useResponseTemplateSuggestions({
    editor,
    enabled: !isInternalNote && !isTelegram,
  });
  const {
    mentionItems: discordMentionItems,
    mentionNote: discordMentionNote,
    pingAgentTyping,
    searchMentionItems: searchDiscordMentionItems,
    stopAgentTyping,
  } = useDiscordComposer({ conversationId, isDiscord, isInternalNote });

  const {
    draftKey,
    content,
    mentionedUserIds,
    handleInternalNoteChange,
    handleChange,
    resetComposer,
    handlePartialDelivery,
  } = useComposerDraft({
    conversationId,
    integrationKind: integration?.kind,
    editor,
    resetAttachments,
    retainAttachments,
    resetSuggestions,
    setResponseTemplateId,
    setSearchValue,
    pingAgentTyping,
  });

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

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
    isUploading: isUploading || isGalleryUploading,
    responseTemplateId,
    resetComposer,
    onPartialDelivery: handlePartialDelivery,
  });

  useScopedHotkeys('mod+enter', handleSubmit, InboxHotkeyScope.MessageInput);

  const editorRef = useComposerEditorKeyDown({
    editor,
    isInternalNote,
    isSlashMenuOpen,
    isUploading: isUploading || isGalleryUploading,
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
    isGalleryUploading ||
    (!content?.length && attachments.length === 0);

  return (
    <ComposerShell
      onDrop={handleDrop}
      disabled={loading || isUploading || isGalleryUploading}
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
        isTelegram={isTelegram}
        isMessenger={isMessenger}
        isInternalNote={isInternalNote}
        isUploading={isUploading || isGalleryUploading}
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
