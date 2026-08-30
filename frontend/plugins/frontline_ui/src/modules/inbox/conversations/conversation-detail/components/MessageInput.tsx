import {
  BlockEditor, Button, Input, Kbd, Spinner, Toggle, cn, readImage,
} from 'erxes-ui';
import {
  IconArrowBackUp, IconArrowUp, IconCommand, IconCornerDownLeft, IconFile,
  IconMessage2, IconPaperclip, IconPhoto, IconX,
} from '@tabler/icons-react';
import { AssignMemberInEditor, MentionInEditor } from 'ui-modules';

import { ComposerAttachment } from '@/inbox/conversations/conversation-detail/components/ComposerAttachment';
import { PollComposer } from '@/inbox/conversations/conversation-detail/components/PollComposer';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { ResponseTemplateSelector } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateSelector';
import {
  useMessageInputController,
  type MessageInputController,
} from '@/inbox/conversations/conversation-detail/hooks/useMessageInputController';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';

export const MessageInput = ({ conversationId }: { conversationId: string }) => (
  <MessageInputView controller={useMessageInputController(conversationId)} />
);

const MessageInputView = ({ controller }: { controller: MessageInputController }) => {
  const {
    attachments, attachmentPreview, availableChannels, content,
    discordMentionItems, discordMentionNote, editor,
    goBackToPreviousHotkeyScope, handleChange, handleDeleteAttachment,
    handleDrop, handleFileInput, handleKeyDown, handleSendPoll, handleSubmit,
    handleTemplateSelect, hideInput, isDiscord, isInternalNote, isLoading,
    loading, onlyInternal, replyTo, searchDiscordMentionItems, selectedIndex,
    setHotkeyScopeAndMemorizePreviousScope, setIsInternalNote, setReplyTo,
    setShowSuggestions, showSuggestions, stopAgentTyping, suggestions, t,
  } = controller;

  if (hideInput) return null;

  return (
    <div className="flex max-h-[min(48vh,24rem)] min-h-0 flex-col overflow-y-auto px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3 sm:pt-3 sm:pb-3">
      {(!isInternalNote && replyTo) ||
      attachmentPreview ||
      attachments.length > 0 ? (
        <div className="mx-auto mb-2 flex w-full max-w-3xl flex-none flex-col gap-2">
          {!isInternalNote && replyTo && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/55 px-3 py-2 text-sm shadow-xs">
              <div className="flex min-w-0 items-center gap-2.5 text-muted-foreground">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconArrowBackUp className="size-4" />
                </span>
                {replyTo.attachment?.type?.startsWith('image') && (
                  <img
                    src={readImage(replyTo.attachment.url)}
                    alt={replyTo.attachment.name || 'Reply attachment'}
                    className="size-9 flex-none rounded-lg object-cover"
                  />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {replyTo.nativeReply ? 'Replying to' : 'Quoting'}{' '}
                    {replyTo.authorName || 'message'}
                  </span>
                  <span className="block truncate text-xs">
                    {replyTo.preview}
                  </span>
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Cancel reply"
                onClick={() => setReplyTo(null)}
                className="shrink-0 rounded-full text-muted-foreground"
              >
                <IconX className="size-4" aria-hidden="true" />
              </Button>
            </div>
          )}

          {attachmentPreview && (
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 shadow-xs">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-xs">
                {attachmentPreview.type.startsWith('image/') ? (
                  <IconPhoto className="size-4" />
                ) : (
                  <IconFile className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {attachmentPreview.name}
                </p>
                <p className="text-xs text-muted-foreground">Uploading…</p>
              </div>
              <Spinner size="sm" />
            </div>
          )}

          {attachments.length > 0 && (
            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-xl">
              {attachments.map((file) => (
                <ComposerAttachment
                  key={file.url}
                  attachment={file}
                  onRemove={() => handleDeleteAttachment(file.url)}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div
        onDropCapture={handleDrop}
        onKeyDown={handleKeyDown}
        onDragOverCapture={(e) => e.preventDefault()}
        className={cn(
          'mx-auto flex min-h-24 w-full max-w-3xl flex-none flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-colors duration-150',
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

        <BlockEditor
          editor={editor}
          onChange={handleChange}
          disabled={loading}
          className={cn(
            'min-h-12 max-h-28 w-full flex-none overflow-y-auto px-1 pt-1',
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

        <div className="mt-1 flex min-w-0 flex-none items-center gap-1 border-t border-border/50 px-2 py-2 sm:px-3">
          <Toggle
            pressed={isInternalNote}
            size="lg"
            variant="outline"
            className="min-w-0 max-w-24 px-2 sm:max-w-full sm:px-4"
            onPressedChange={() =>
              !onlyInternal && setIsInternalNote(!isInternalNote)
            }
          >
            <span className="truncate">{t('internal-note')}</span>
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

          <Button
            size="sm"
            className="ml-auto h-9 flex-none rounded-lg px-2.5 sm:px-4"
            disabled={
              loading ||
              isLoading ||
              (!content?.length && attachments.length === 0)
            }
            onClick={handleSubmit}
          >
            {loading || isLoading ? <Spinner size="sm" /> : <IconArrowUp />}
            <span className="hidden sm:inline">{t('send')}</span>
            <Kbd className="ml-1 hidden lg:flex">
              <IconCommand size={12} />
              <IconCornerDownLeft size={12} />
            </Kbd>
          </Button>
        </div>
      </div>
    </div>
  );
};
