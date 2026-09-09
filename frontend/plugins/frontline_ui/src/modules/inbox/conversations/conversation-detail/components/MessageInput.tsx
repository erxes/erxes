import {
  BlockEditor,
  Button,
  Input,
  Kbd,
  Spinner,
  DropdownMenu,
  cn,
  readImage,
} from 'erxes-ui';
import {
  IconArrowBackUp,
  IconArrowUp,
  IconCommand,
  IconCornerDownLeft,
  IconFile,
  IconMessage2,
  IconLock,
  IconChevronDown,
  IconChevronUp,
  IconPaperclip,
  IconPhoto,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { AssignMemberInEditor, MentionInEditor } from 'ui-modules';

import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';
import { ComposerAttachment } from '@/inbox/conversations/conversation-detail/components/ComposerAttachment';
import { PollComposer } from '@/inbox/conversations/conversation-detail/components/PollComposer';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { ResponseTemplateSelector } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateSelector';
import { SendPollDialog } from '@/inbox/conversations/conversation-detail/components/SendPollDialog';
import {
  useMessageInputController,
  type MessageInputController,
} from '@/inbox/conversations/conversation-detail/hooks/useMessageInputController';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';

type MessageInputControllerProps = {
  controller: MessageInputController;
};

const ReplyPreview = ({ controller }: MessageInputControllerProps) => {
  const { isInternalNote, replyTo, setReplyTo } = controller;

  if (isInternalNote || !replyTo) return null;

  const imageAttachment = replyTo.attachment?.type?.startsWith('image');

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/55 px-3 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2.5 text-muted-foreground">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconArrowBackUp className="size-4" />
        </span>
        {imageAttachment && (
          <InboxImage
            src={readImage(replyTo.attachment?.url)}
            alt={replyTo.attachment?.name || 'Reply attachment'}
            className="size-9 flex-none rounded-lg object-cover"
          />
        )}
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold text-foreground">
            {replyTo.nativeReply ? 'Replying to' : 'Quoting'}{' '}
            {replyTo.authorName || 'message'}
          </span>
          <span className="block truncate text-xs">{replyTo.preview}</span>
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
  );
};

const UploadPreview = ({ controller }: MessageInputControllerProps) => {
  const { attachmentPreview } = controller;

  if (!attachmentPreview) return null;

  const AttachmentIcon = attachmentPreview.type.startsWith('image/')
    ? IconPhoto
    : IconFile;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-xs">
        <AttachmentIcon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{attachmentPreview.name}</p>
        <p className="text-xs text-muted-foreground">Uploading…</p>
      </div>
      <Spinner size="sm" />
    </div>
  );
};

const AttachmentList = ({ controller }: MessageInputControllerProps) => {
  const { attachments, handleDeleteAttachment } = controller;

  if (!attachments.length) return null;

  return (
    <div className="flex flex-wrap gap-2 rounded-xl">
      {attachments.map((file) => (
        <ComposerAttachment
          key={file.url}
          attachment={file}
          onRemove={() => handleDeleteAttachment(file.url)}
        />
      ))}
    </div>
  );
};

const ComposerPreviews = ({ controller }: MessageInputControllerProps) => {
  const { attachments, attachmentPreview, isInternalNote, replyTo } =
    controller;
  const hasPreview =
    (!isInternalNote && Boolean(replyTo)) ||
    Boolean(attachmentPreview) ||
    attachments.length > 0;

  if (!hasPreview) return null;

  return (
    <div className="flex max-h-36 flex-none flex-col gap-2 overflow-y-auto border-b border-border/50 p-2">
      <ReplyPreview controller={controller} />
      <UploadPreview controller={controller} />
      <AttachmentList controller={controller} />
    </div>
  );
};

const TemplateSuggestions = ({ controller }: MessageInputControllerProps) => {
  const {
    availableChannels,
    handleTemplateSelect,
    isInternalNote,
    selectedIndex,
    setShowSuggestions,
    showSuggestions,
    suggestions,
  } = controller;

  if (!showSuggestions || isInternalNote) return null;

  return (
    <ResponseTemplateDropdown
      suggestions={suggestions}
      selectedIndex={selectedIndex}
      availableChannels={availableChannels}
      onSelect={(content: string, templateId?: string) => {
        handleTemplateSelect(content, templateId);
        setShowSuggestions(false);
      }}
    />
  );
};

const ComposerEditor = ({ controller }: MessageInputControllerProps) => {
  const {
    discordMentionItems,
    discordMentionNote,
    editor,
    goBackToPreviousHotkeyScope,
    handleChange,
    isDiscord,
    isInternalNote,
    loading,
    searchDiscordMentionItems,
    setHotkeyScopeAndMemorizePreviousScope,
    stopAgentTyping,
  } = controller;

  return (
    <BlockEditor
      editor={editor}
      onChange={handleChange}
      disabled={loading}
      className={cn(
        'min-h-12 w-full flex-none',
        isInternalNote && 'internal-note',
      )}
      onFocus={() =>
        setHotkeyScopeAndMemorizePreviousScope(InboxHotkeyScope.MessageInput)
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
  );
};

const ComposerToolbar = ({ controller }: MessageInputControllerProps) => {
  const {
    attachments,
    content,
    conversationId,
    handleFileInput,
    handleSendPoll,
    handleSubmit,
    handleTemplateSelect,
    integrationChannelId,
    isDiscord,
    isInternalNote,
    isMessenger,
    isLoading,
    loading,
    onlyInternal,
    setIsInternalNote,
    t,
  } = controller;
  const sendDisabled =
    loading || isLoading || (!content?.length && attachments.length === 0);

  let sendIcon;
  if (loading || isLoading) {
    sendIcon = <Spinner size="sm" />;
  } else if (isInternalNote) {
    sendIcon = <IconLock />;
  } else {
    sendIcon = <IconArrowUp />;
  }

  return (
    <div className="mt-1 flex min-w-0 flex-none flex-wrap items-center gap-1 border-t border-border/50 px-2 py-2 sm:px-3">
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
        <SendPollDialog
          conversationId={conversationId}
          channelId={integrationChannelId}
          disabled={loading}
        />
      )}

      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {!onlyInternal && (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={onlyInternal || loading || isLoading}
                aria-label={t('message-mode', { defaultValue: 'Message mode' })}
                className={cn(
                  'h-9 gap-1.5',
                  isInternalNote && 'border-warning/50 bg-warning/20',
                )}
              >
                {isInternalNote ? <IconLock /> : <IconMessage2 />}
                {isInternalNote
                  ? t('internal-note')
                  : t('reply', { defaultValue: 'Reply' })}
                <IconChevronDown className="size-3.5" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.RadioGroup
                value={isInternalNote ? 'note' : 'reply'}
                onValueChange={(value) => setIsInternalNote(value === 'note')}
              >
                <DropdownMenu.RadioItem value="reply" disabled={onlyInternal}>
                  {t('reply-to-customer', {
                    defaultValue: 'Reply to customer',
                  })}
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="note">
                  {t('internal-note')}
                </DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
        <Button
          size="sm"
          aria-label={
            isInternalNote
              ? t('add-note', { defaultValue: 'Add note' })
              : t('send-reply', { defaultValue: 'Send reply' })
          }
          className={cn(
            'h-9 flex-none rounded-lg px-2.5 sm:px-4',
            isInternalNote && 'bg-warning text-foreground hover:bg-warning/80',
          )}
          disabled={sendDisabled}
          onClick={handleSubmit}
        >
          {sendIcon}
          <span>
            {isInternalNote
              ? t('add-note', { defaultValue: 'Add note' })
              : t('send-reply', { defaultValue: 'Send reply' })}
          </span>
          <Kbd className="ml-1 hidden lg:flex">
            <IconCommand size={12} />
            <IconCornerDownLeft size={12} />
          </Kbd>
        </Button>
      </div>
    </div>
  );
};

const Composer = ({
  controller,
  onCollapse,
}: MessageInputControllerProps & { onCollapse: () => void }) => (
  <div className="px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3 sm:pt-3 sm:pb-3">
    <div
      onDropCapture={controller.handleDrop}
      onKeyDown={controller.handleKeyDown}
      onDragOverCapture={(event) => event.preventDefault()}
      className={cn(
        'mx-auto flex max-h-[min(70vh,40rem)] min-h-28 w-full max-w-3xl flex-col gap-1 rounded-2xl border border-border/70 bg-background/95 py-2 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-colors duration-150',
        controller.isInternalNote && 'border-warning/50 bg-warning/20',
      )}
    >
      <output className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground">
        {controller.isInternalNote ? (
          <IconLock className="size-3.5 shrink-0" />
        ) : (
          <IconMessage2 className="size-3.5 shrink-0" />
        )}
        {controller.isInternalNote
          ? controller.t('note-visibility', {
              defaultValue: 'Internal note · Only visible to your team',
            })
          : controller.t('reply-visibility', {
              defaultValue: 'Reply · Sent to the customer',
            })}
        {controller.isInternalNote && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto size-7 rounded-full"
            aria-label="Collapse internal note composer"
            onClick={onCollapse}
          >
            <IconChevronDown className="size-4" />
          </Button>
        )}
      </output>
      <ComposerPreviews controller={controller} />
      <TemplateSuggestions controller={controller} />
      <ComposerEditor controller={controller} />
      <ComposerToolbar controller={controller} />
    </div>
  </div>
);

const CompactInternalNote = ({
  controller,
  onExpand,
}: MessageInputControllerProps & { onExpand: () => void }) => (
  <div className="px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3">
    <Button
      type="button"
      variant="outline"
      className="mx-auto flex h-11 w-full max-w-3xl justify-start rounded-xl border-warning/40 bg-warning/10 px-3 text-warning hover:bg-warning/20"
      onClick={onExpand}
      aria-label="Expand internal note composer"
    >
      <IconLock className="size-4" />
      <span className="text-xs font-medium">
        {controller.t('internal-note')}
      </span>
      <span className="hidden truncate text-xs font-normal text-muted-foreground sm:inline">
        {controller.t('note-visibility', {
          defaultValue: 'Only visible to your team',
        })}
      </span>
      <IconChevronUp className="ml-auto size-4" />
    </Button>
  </div>
);

const MessageInputView = ({ controller }: MessageInputControllerProps) => {
  const [compact, setCompact] = useState(false);

  if (controller.hideInput) return null;

  if (compact && controller.isInternalNote) {
    return (
      <CompactInternalNote
        controller={controller}
        onExpand={() => setCompact(false)}
      />
    );
  }

  return (
    <Composer controller={controller} onCollapse={() => setCompact(true)} />
  );
};

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => (
  <MessageInputView controller={useMessageInputController(conversationId)} />
);
