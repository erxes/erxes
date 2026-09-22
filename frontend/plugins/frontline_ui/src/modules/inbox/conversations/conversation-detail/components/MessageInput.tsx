import { BlockEditor, Button, Input, Kbd, Spinner, Toggle, cn } from 'erxes-ui';
import {
  IconArrowBackUp,
  IconArrowUp,
  IconCommand,
  IconCornerDownLeft,
  IconFile,
  IconMessage2,
  IconPaperclip,
  IconX,
} from '@tabler/icons-react';
import { AssignMemberInEditor, MentionInEditor } from 'ui-modules';

import { PollComposer } from '@/inbox/conversations/conversation-detail/components/PollComposer';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { ResponseTemplateSelector } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateSelector';
import { SendSurveyDialog } from '@/inbox/conversations/conversation-detail/components/SendSurveyDialog';
import { useMessageInputController } from '@/inbox/conversations/conversation-detail/hooks/useMessageInputController';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const controller = useMessageInputController(conversationId);
  const {
    attachments,
    attachmentPreview,
    availableChannels,
    content,
    discordMentionItems,
    discordMentionNote,
    editor,
    goBackToPreviousHotkeyScope,
    handleChange,
    handleDeleteAttachment,
    handleDrop,
    handleFileInput,
    handleKeyDown,
    handleSendPoll,
    handleSubmit,
    handleTemplateSelect,
    hideInput,
    integrationChannelId,
    isDiscord,
    isInternalNote,
    isLoading,
    isMessenger,
    loading,
    onlyInternal,
    replyTo,
    searchDiscordMentionItems,
    selectedIndex,
    setHotkeyScopeAndMemorizePreviousScope,
    setIsInternalNote,
    setReplyTo,
    setShowSuggestions,
    showSuggestions,
    stopAgentTyping,
    suggestions,
    t,
  } = controller;

  if (hideInput) return null;

  const sendDisabled =
    loading || isLoading || (!content?.length && attachments.length === 0);

  return (
    <div className="h-full p-2">
      <div
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => event.preventDefault()}
        className={cn(
          'mx-auto flex h-full max-w-2xl flex-col gap-1 rounded-lg bg-sidebar py-4 shadow-xs transition-colors duration-150',
          isInternalNote && 'bg-warning/20',
        )}
      >
        {showSuggestions && !isInternalNote && (
          <ResponseTemplateDropdown
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            availableChannels={availableChannels}
            onSelect={(templateContent, templateId) => {
              handleTemplateSelect(templateContent, templateId);
              setShowSuggestions(false);
            }}
          />
        )}

        {!isInternalNote && replyTo && (
          <div className="mx-6 mb-1 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
            <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <IconArrowBackUp className="size-4 flex-none" />
              <span className="truncate">
                {replyTo.nativeReply
                  ? t('replying-to', 'Replying to:')
                  : t('quoting', 'Quoting')}{' '}
                {replyTo.authorName || t('message', 'message')} ·{' '}
                {replyTo.preview}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('cancel-reply', 'Cancel reply')}
              onClick={() => setReplyTo(null)}
              className="size-7 flex-none"
            >
              <IconX size={14} aria-hidden="true" />
            </Button>
          </div>
        )}

        <BlockEditor
          editor={editor}
          onChange={handleChange}
          disabled={loading}
          className={cn(
            'h-full w-full overflow-y-auto',
            isInternalNote && 'internal-note',
          )}
          onFocus={() =>
            setHotkeyScopeAndMemorizePreviousScope(
              InboxHotkeyScope.MessageInput,
            )
          }
          onBlur={() => {
            goBackToPreviousHotkeyScope();
            stopAgentTyping();
          }}
        >
          {isInternalNote && <AssignMemberInEditor editor={editor} />}
          {isDiscord && !isInternalNote && (
            <MentionInEditor
              editor={editor}
              participants={discordMentionItems}
              searchItems={searchDiscordMentionItems}
              statusNote={discordMentionNote}
            />
          )}
        </BlockEditor>

        {attachmentPreview && (
          <div className="mx-6 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            <IconFile className="size-4" />
            <span className="min-w-0 flex-1 truncate">
              {attachmentPreview.name}
            </span>
            <Spinner size="sm" />
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mx-6 mt-2 space-y-1 text-sm text-muted-foreground">
            {attachments.map((attachment) => (
              <div
                key={attachment.url}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-1"
              >
                <span className="min-w-0 truncate">
                  {attachment.name || t('attachment', 'Attachment')} (
                  {Math.round((attachment.size || 0) / 1024)} KB)
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t('remove-attachment', 'Remove attachment')}
                  onClick={() => handleDeleteAttachment(attachment.url)}
                  className="size-7 text-destructive"
                >
                  <IconX size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1 px-2 sm:gap-4 sm:px-6">
          <Toggle
            pressed={isInternalNote}
            size="lg"
            variant="outline"
            className="min-w-20 max-w-full px-2 sm:px-5"
            disabled={onlyInternal}
            onPressedChange={(pressed) => setIsInternalNote(pressed)}
          >
            <span className="truncate">
              {t('internal-note', 'Internal Note')}
            </span>
          </Toggle>

          {!isInternalNote && (
            <ResponseTemplateSelector onSelect={handleTemplateSelect}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('response-templates', 'Response templates')}
                className="size-8 rounded-full text-muted-foreground"
              >
                <IconMessage2 className="size-4" />
              </Button>
            </ResponseTemplateSelector>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('attach-file', 'Attach file')}
            className="size-8 flex-none rounded-full text-muted-foreground"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <IconPaperclip className="size-4" />
          </Button>
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileInput}
            multiple
          />

          {isDiscord && !isInternalNote && (
            <PollComposer onSubmit={handleSendPoll} loading={loading} />
          )}

          {isMessenger && !isInternalNote && (
            <SendSurveyDialog
              conversationId={conversationId}
              channelId={integrationChannelId}
            />
          )}

          <Button
            type="button"
            size="lg"
            className="ml-auto flex-none"
            disabled={sendDisabled}
            onClick={handleSubmit}
          >
            {loading || isLoading ? <Spinner size="sm" /> : <IconArrowUp />}
            {t('send', 'Send')}
            <Kbd className="ml-1 hidden sm:flex">
              <IconCommand size={12} />
              <IconCornerDownLeft size={12} />
            </Kbd>
          </Button>
        </div>
      </div>
    </div>
  );
};
