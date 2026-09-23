import { MessageFileAttachment } from '@/inbox/conversation-messages/components/MessageFileAttachment';
import { BlockEditor, Button, Input, Kbd, Spinner, Toggle, cn } from 'erxes-ui';
import {
  IconArrowBackUp,
  IconArrowUp,
  IconCommand,
  IconCornerDownLeft,
  IconMessage2,
  IconPaperclip,
  IconX,
} from '@tabler/icons-react';

import { useTranslation } from 'react-i18next';

import { AssignMemberInEditor, MentionInEditor } from 'ui-modules';

import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { ResponseTemplateSelector } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateSelector';
import { PollComposer } from '@/inbox/conversations/conversation-detail/components/PollComposer';
import { SendSurveyDialog } from '@/inbox/conversations/conversation-detail/components/SendSurveyDialog';

import { useMessageInput } from '@/inbox/conversations/conversation-detail/hooks/useMessageInput';

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { t } = useTranslation('frontline');
  const {
    isInternalNote,
    setIsInternalNote,
    onlyInternal,
    hideInput,
    integration,
    isDiscord,
    isMessenger,
    replyPreview,
    setDiscordReplyTo,
    setMessageReply,
    discordMentionItems,
    searchDiscordMentionItems,
    discordMentionNote,
    availableChannels,
    content,
    attachments,
    attachmentPreview,
    editor,
    loading,
    isLoading,
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
    stopAgentTyping,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    handleFileInput,
    handleDrop,
    handleDeleteAttachment,
    handleTemplateSelect,
    handleKeyDown,
    handleChange,
    handleSubmit,
    handleSendPoll,
  } = useMessageInput(conversationId);
  if (hideInput) return null;

  return (
    <div className="p-2 h-full">
      <div
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'flex flex-col h-full py-4 gap-1 max-w-2xl mx-auto bg-sidebar shadow-xs rounded-lg transition-colors duration-150',
          isInternalNote && 'bg-warning/20',
        )}
      >
        {showSuggestions && !isInternalNote && (
          <ResponseTemplateDropdown
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            availableChannels={availableChannels}
            onSelect={(content: string, templateId?: string) => {
              handleTemplateSelect(content, templateId);
              setShowSuggestions(false);
            }}
          />
        )}

        {!isInternalNote && replyPreview && (
          <div className="mx-6 mb-1 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
            <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <IconArrowBackUp className="size-4 flex-none" />
              <span className="truncate">
                {t('replying-to', 'Replying to:')} {replyPreview.preview}
              </span>
            </div>
            <button
              type="button"
              aria-label="Cancel reply"
              onClick={() => {
                setDiscordReplyTo(null);
                setMessageReply(null);
              }}
              className="flex-none text-muted-foreground hover:text-foreground"
            >
              <IconX size={14} aria-hidden="true" />
            </button>
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
          <div className="px-6 mb-2">
            <p className="text-sm">{attachmentPreview.name}</p>
            {attachmentPreview.type.startsWith('image/') && (
              <img
                src={attachmentPreview.data}
                alt="preview"
                className="max-w-[400px] max-h-[300px] rounded-lg shadow-sm mt-1"
              />
            )}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-6 py-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.url}
                className="flex max-w-full items-center gap-1"
              >
                <MessageFileAttachment attachment={attachment} />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('remove-attachment', 'Remove attachment')}
                  onClick={() => handleDeleteAttachment(attachment.name)}
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex min-w-0 flex-wrap items-center gap-1 px-2 mt-2 sm:gap-4 sm:px-6">
          <Toggle
            pressed={isInternalNote}
            size="lg"
            variant="outline"
            className="min-w-20 max-w-full px-2 sm:px-5"
            onPressedChange={() =>
              !onlyInternal && setIsInternalNote(!isInternalNote)
            }
          >
            <span className="truncate">
              {t('internal-note', 'Internal Note')}
            </span>
          </Toggle>

          {!isInternalNote && (
            <ResponseTemplateSelector onSelect={handleTemplateSelect}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <IconMessage2 className="h-4 w-4" />
              </Button>
            </ResponseTemplateSelector>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-none rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <IconPaperclip className="h-4 w-4" />
            <Input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              multiple
            />
          </Button>

          {isDiscord && !isInternalNote && (
            <PollComposer onSubmit={handleSendPoll} loading={loading} />
          )}

          {isMessenger && !isInternalNote && (
            <SendSurveyDialog
              conversationId={conversationId}
              channelId={integration?.channelId}
            />
          )}

          <Button
            size="lg"
            className="ml-auto flex-none"
            disabled={
              loading ||
              isLoading ||
              (!content?.length && attachments.length === 0)
            }
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
