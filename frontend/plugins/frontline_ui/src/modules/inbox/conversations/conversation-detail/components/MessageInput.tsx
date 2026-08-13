import { BlockEditor, cn } from 'erxes-ui';
import { AssignMemberInEditor, MentionInEditor } from 'ui-modules';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { DiscordReplyPreview } from '@/inbox/conversations/conversation-detail/components/message-input/DiscordReplyPreview';
import { MessageInputAttachments } from '@/inbox/conversations/conversation-detail/components/message-input/MessageInputAttachments';
import { MessageInputHeader } from '@/inbox/conversations/conversation-detail/components/message-input/MessageInputHeader';
import { MessageInputToolbar } from '@/inbox/conversations/conversation-detail/components/message-input/MessageInputToolbar';
import { useMessageInput } from '@/inbox/conversations/conversation-detail/hooks/useMessageInput';

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const {
    attachmentState,
    canSend,
    discordReplyTo,
    discordState,
    editor,
    handleCancelDiscordReply,
    handleChange,
    handleDragOver,
    handleEditorBlur,
    handleEditorFocus,
    handleInternalNoteChange,
    handleSendPoll,
    handleSubmit,
    hideInput,
    internalNoteLabel,
    isDiscord,
    isInternalNote,
    loading,
    templateState,
  } = useMessageInput(conversationId);

  if (hideInput) return null;

  return (
    <div className="h-full p-3">
      <div
        onDrop={attachmentState.handleDrop}
        onKeyDown={templateState.handleSuggestionKeyDown}
        onDragOver={handleDragOver}
        className={cn(
          'mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition-colors duration-150',
          isInternalNote && 'border-warning/40 bg-warning/5',
        )}
      >
        <MessageInputHeader
          internalNoteLabel={internalNoteLabel}
          isInternalNote={isInternalNote}
        />

        {templateState.showSuggestions && !isInternalNote && (
          <ResponseTemplateDropdown
            suggestions={templateState.suggestions}
            selectedIndex={templateState.selectedIndex}
            availableChannels={templateState.availableChannels}
            onSelect={templateState.handleTemplateSelect}
          />
        )}

        {isDiscord && !isInternalNote && discordReplyTo && (
          <DiscordReplyPreview
            preview={discordReplyTo.preview}
            onCancel={handleCancelDiscordReply}
          />
        )}

        <BlockEditor
          editor={editor}
          onChange={handleChange}
          disabled={loading}
          className={cn(
            'h-full min-h-32 w-full overflow-y-auto px-2 py-1',
            isInternalNote && 'internal-note',
          )}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
        >
          {isInternalNote && <AssignMemberInEditor editor={editor} />}
          {isDiscord && !isInternalNote && (
            <MentionInEditor
              editor={editor}
              participants={discordState.mentionItems}
              searchItems={discordState.searchMentionItems}
              statusNote={discordState.mentionStatusNote}
            />
          )}
        </BlockEditor>

        <MessageInputAttachments
          attachmentPreview={attachmentState.attachmentPreview}
          attachments={attachmentState.attachments}
          onDelete={attachmentState.handleDeleteAttachment}
        />

        <MessageInputToolbar
          canSend={canSend}
          internalNoteLabel={internalNoteLabel}
          isDiscord={isDiscord}
          isInternalNote={isInternalNote}
          isLoading={loading}
          isUploading={attachmentState.isUploading}
          onFileInput={attachmentState.handleFileInput}
          onInternalNoteChange={handleInternalNoteChange}
          onSend={handleSubmit}
          onSendPoll={handleSendPoll}
          onTemplateSelect={templateState.handleTemplateSelect}
        />
      </div>
    </div>
  );
};
