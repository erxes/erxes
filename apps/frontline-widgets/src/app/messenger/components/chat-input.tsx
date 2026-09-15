import { FC, useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  IconArrowRight,
  IconDownload,
  IconFileAlert,
  IconMoodSmile,
  IconPaperclip,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  Dialog,
  IAttachment,
  Popover,
  readImage,
  Spinner,
  useUpload,
} from 'erxes-ui';
import { EmojiPicker } from 'ui-modules/modules/automations/components/EmojiPicker';
import { useAtom } from 'jotai';
import { formatFileSize, getAttachmentType } from '@libs/format-file';
import { InitialMessage } from '../constants';
import { connectionAtom, widgetReplyToAtom } from '../states';
import { useCustomerData } from '../hooks/useCustomerData';
import { useChatInput } from '../hooks/useChatInput';
import { PersistentMenu } from './persistent-menu';
import { useMessenger } from '../hooks/useMessenger';
import { Attachment } from './attachment';
import { getAttachmentIcon } from './attachment-type';
import {
  getMaxUploadSize,
  toPendingFile,
  type PendingFile,
} from '../utils/fileUpload';

type ChatInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[character] || character),
  );

function UploadedAttachment({
  attachment,
  onRemove,
}: {
  attachment: IAttachment;
  onRemove: () => void;
}) {
  const fileType = getAttachmentType(attachment.type, attachment.name);
  const FileTypeIcon = getAttachmentIcon(fileType);
  const isImage = fileType === 'image';

  return (
    <Dialog>
      <Attachment
        size="sm"
        state="done"
        className="cursor-pointer hover:bg-muted/60"
      >
        {isImage ? (
          <Attachment.Media variant="image">
            <img src={readImage(attachment.url)} alt={attachment.name} />
          </Attachment.Media>
        ) : (
          <Attachment.Media>
            <FileTypeIcon />
          </Attachment.Media>
        )}
        <Attachment.Content>
          <Attachment.Title>{attachment.name}</Attachment.Title>
          <Attachment.Description>
            {`${formatFileSize(attachment.size || 0)} · Preview`}
          </Attachment.Description>
        </Attachment.Content>
        <Dialog.Trigger asChild>
          <Attachment.Trigger aria-label={`Preview ${attachment.name}`} />
        </Dialog.Trigger>
        <Attachment.Actions>
          <Attachment.Action
            type="button"
            aria-label={`Remove ${attachment.name}`}
            onClick={onRemove}
          >
            <IconX />
          </Attachment.Action>
        </Attachment.Actions>
      </Attachment>
      <Dialog.Content className="max-w-2xl rounded-2xl">
        <Dialog.Header>
          <Dialog.Title className="truncate">{attachment.name}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Attachment preview for {attachment.name}
          </Dialog.Description>
        </Dialog.Header>
        {isImage ? (
          <div className="flex items-center justify-center p-2">
            <img
              src={readImage(attachment.url)}
              alt={attachment.name}
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
              <FileTypeIcon className="size-7" />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(attachment.size || 0)}
            </p>
            <Button asChild size="sm">
              <a
                href={readImage(attachment.url)}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <IconDownload />
                Download file
              </a>
            </Button>
          </div>
        )}
        <Dialog.Close asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3"
            aria-label="Close attachment preview"
          >
            <IconX />
          </Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog>
  );
}

export const ChatInput: FC<ChatInputProps> = ({ className, ...inputProps }) => {
  const [connection] = useAtom(connectionAtom);
  const [replyTo, setReplyTo] = useAtom(widgetReplyToAtom);
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const uploadQueueRef = useRef<File[]>([]);
  const activeUploadRef = useRef<File | null>(null);
  const sawUploadRunningRef = useRef(false);
  /** Names dismissed mid-flight — the request cannot be aborted, so its late
   *  response has to be dropped instead of silently re-attaching the file. */
  const cancelledUploadsRef = useRef<Set<File>>(new Set());
  const { upload, isLoading: isUploadRunning } = useUpload();
  const { activeTab, switchToTab } = useMessenger();
  const { messengerData } = connection.widgetsMessengerConnect || {};
  const { messages, isOnline, requireAuth } = messengerData || {};
  const defaultPlaceholder = isOnline
    ? InitialMessage.WELCOME
    : messages?.away || InitialMessage.AWAY;
  const placeholder = activeTab === 'chat' ? 'Reply...' : defaultPlaceholder;
  const id = useId();
  const {
    message,
    setMessage,
    handleInputChange,
    handleSubmit,
    isDisabled,
    loading,
  } = useChatInput();
  const { hasEmailOrPhone } = useCustomerData();
  const shouldDisable = requireAuth === true && !hasEmailOrPhone;
  const isChat = activeTab === 'chat';

  useEffect(() => {
    if (replyTo) messageInputRef.current?.focus();
  }, [replyTo]);

  const handleDisabledClick = () => {
    if (shouldDisable) switchToTab('messages');
  };

  const startNextUpload = useCallback(() => {
    if (activeUploadRef.current) return;

    const file = uploadQueueRef.current.shift();
    if (!file) return;

    activeUploadRef.current = file;
    const files = new DataTransfer();
    files.items.add(file);

    upload({
      files: files.files,
      afterUpload: ({ response, fileInfo }) => {
        activeUploadRef.current = null;

        if (!cancelledUploadsRef.current.delete(file)) {
          setAttachments((prev) => [
            ...prev,
            {
              url: response,
              name: fileInfo.name,
              size: fileInfo.size,
              type: fileInfo.type,
            },
          ]);
          setPendingFiles((prev) => {
            const index = prev.findIndex(
              ({ name, state }) =>
                name === fileInfo.name && state === 'uploading',
            );
            if (index === -1) return prev;

            const next = [...prev];
            const [uploaded] = next.splice(index, 1);
            if (uploaded.preview) URL.revokeObjectURL(uploaded.preview);
            return next;
          });
        }

        startNextUpload();
      },
    });
  }, [upload]);

  // `useUpload` has no error callback. Running one file at a time makes its
  // loading transition an unambiguous failure signal for the active file.
  useEffect(() => {
    if (isUploadRunning) {
      sawUploadRunningRef.current = true;
      return;
    }
    if (!sawUploadRunningRef.current || !activeUploadRef.current) return;

    sawUploadRunningRef.current = false;
    const failedFile = activeUploadRef.current;
    activeUploadRef.current = null;
    cancelledUploadsRef.current.delete(failedFile);
    setPendingFiles((prev) => {
      const index = prev.findIndex(
        ({ name, state }) => name === failedFile.name && state === 'uploading',
      );
      if (index === -1) return prev;

      const next = [...prev];
      next[index] = {
        ...next[index],
        state: 'error',
        error: 'Upload failed. Remove and try again.',
      };
      return next;
    });
    startNextUpload();
  }, [isUploadRunning, startNextUpload]);
  // A failed upload stays on screen but must not hold the send button hostage.
  const isUploading = pendingFiles.some((file) => file.state === 'uploading');
  const canSend = (!isDisabled || attachments.length > 0) && !isUploading;

  const totalQueued = attachments.length + pendingFiles.length;
  const uploadedCount = attachments.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    // Oversized files are dropped by `useUpload` with a bare `continue`, which
    // resolves nothing and — when every file is oversized — leaves its own
    // loading flag stuck on. Reject them here so only real uploads are sent.
    const maxUploadSize = getMaxUploadSize();
    const selected = Array.from(files);
    const accepted = selected.filter((file) => file.size <= maxUploadSize);

    setPendingFiles((prev) => [
      ...prev,
      ...selected.map((file) => {
        if (file.size <= maxUploadSize) return toPendingFile(file, 'uploading');
        return {
          ...toPendingFile(file, 'error'),
          error: `Larger than ${Math.round(maxUploadSize / 1024 / 1024)}MB`,
        };
      }),
    ]);

    e.target.value = '';

    if (accepted.length === 0) return;

    uploadQueueRef.current.push(...accepted);
    startNextUpload();
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const dismissPendingFile = (index: number) => {
    setPendingFiles((prev) => {
      const dismissed = prev[index];
      if (!dismissed) return prev;
      if (dismissed.state === 'uploading') {
        cancelledUploadsRef.current.add(dismissed.file);
      }
      if (dismissed.preview) {
        URL.revokeObjectURL(dismissed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const hasStrip =
    isChat && (attachments.length > 0 || pendingFiles.length > 0);

  return (
    <div className="flex flex-col grow-0 shrink-0">
      {hasStrip && (
        <div className="flex flex-col px-3 pt-2 gap-1.5">
          {isUploading && (
            <span className="text-[11px] text-muted-foreground">
              {uploadedCount} of {totalQueued} uploaded
            </span>
          )}
          <Attachment.Group className="hide-scroll">
            {attachments.map((attachment, index) => (
              <UploadedAttachment
                key={`${attachment.url}-${index}`}
                attachment={attachment}
                onRemove={() => removeAttachment(index)}
              />
            ))}
            {pendingFiles.map((pf, i) => {
              const fileType = getAttachmentType(pf.type, pf.name);
              const FileTypeIcon = getAttachmentIcon(fileType);
              const hasFailed = pf.state === 'error';

              return (
                <Attachment
                  key={`pending-${pf.name}-${i}`}
                  size="sm"
                  state={pf.state}
                >
                  <Attachment.Media variant={pf.preview ? 'image' : 'icon'}>
                    {hasFailed ? (
                      <IconFileAlert />
                    ) : pf.preview ? (
                      <img src={pf.preview} alt={pf.name} />
                    ) : (
                      <FileTypeIcon />
                    )}
                    {pf.state === 'uploading' && (
                      <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Spinner size="sm" />
                      </span>
                    )}
                  </Attachment.Media>
                  <Attachment.Content>
                    <Attachment.Title>{pf.name}</Attachment.Title>
                    <Attachment.Description>
                      {hasFailed
                        ? pf.error || 'Upload failed. Remove and try again.'
                        : 'Uploading'}
                    </Attachment.Description>
                  </Attachment.Content>
                  <Attachment.Actions>
                    <Attachment.Action
                      type="button"
                      aria-label={
                        hasFailed ? `Dismiss ${pf.name}` : `Cancel ${pf.name}`
                      }
                      onClick={() => dismissPendingFile(i)}
                    >
                      <IconX />
                    </Attachment.Action>
                  </Attachment.Actions>
                </Attachment>
              );
            })}
          </Attachment.Group>
        </div>
      )}

      {replyTo && (
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
          <div className="min-w-0">
            <span className="font-semibold text-foreground">
              Replying to {replyTo.authorName}:{' '}
            </span>
            <span className="truncate">{replyTo.content}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 rounded-full"
            onClick={() => setReplyTo(null)}
            aria-label="Cancel reply"
          >
            <IconX className="size-3" />
          </Button>
        </div>
      )}

      <form
        className="p-2 flex"
        onSubmit={(e) =>
          handleSubmit(e, {
            attachments,
            contentOverride: replyTo
              ? `<blockquote><strong>Replying to ${escapeHtml(
                  replyTo.authorName,
                )}</strong><br/>${escapeHtml(
                  replyTo.content,
                )}</blockquote>${message}`
              : undefined,
            onClear: () => {
              setAttachments([]);
              setReplyTo(null);
            },
          })
        }
        autoComplete="off"
      >
        <div className="relative flex items-center gap-1 w-full rounded-2xl shadow-xs p-1.5 ps-2.5 bg-background">
          {shouldDisable && (
            <div
              className="absolute inset-0 z-10 rounded-2xl cursor-pointer"
              onClick={handleDisabledClick}
              aria-label="Sign in to send a message"
            />
          )}
          {isChat && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5 hover:bg-transparent group"
                onClick={() => fileInputRef.current?.click()}
                disabled={shouldDisable}
                aria-label="Attach files"
              >
                <IconPaperclip className="size-4 text-muted-foreground shrink-0 group-hover:text-primary dark:group-hover:text-primary-foreground transition-all" />
              </Button>
            </>
          )}
          <input
            ref={messageInputRef}
            id={id}
            className={cn(
              'border-none py-1.5 h-auto px-1 text-xs bg-transparent text-foreground shadow-none focus-visible:outline-none! focus-visible:ring-0! focus-visible:border-0! placeholder:text-muted-foreground placeholder:font-medium placeholder:text-sm flex-1',
              className,
            )}
            placeholder={
              shouldDisable ? 'Sign in to send a message' : placeholder
            }
            value={message}
            disabled={shouldDisable}
            onChange={handleInputChange}
            {...inputProps}
          />
          {isChat && (
            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <Popover.Trigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-5 hover:bg-transparent group"
                  disabled={shouldDisable}
                  aria-label="Choose emoji"
                >
                  <IconMoodSmile className="size-5 text-muted-foreground shrink-0 group-hover:text-primary dark:group-hover:text-primary-foreground transition-all" />
                </Button>
              </Popover.Trigger>
              <Popover.Content className="p-0 w-auto" align="end" side="top">
                <EmojiPicker
                  className="max-h-80 w-[280px] shadow-none border-0 rounded-none"
                  onEmojiSelect={({ emoji }) => {
                    setMessage(message + emoji);
                    setEmojiOpen(false);
                  }}
                >
                  <EmojiPicker.Search className="text-foreground" />
                  <EmojiPicker.Content className="hide-scroll styled-scroll" />
                  <EmojiPicker.Footer className="text-foreground" />
                </EmojiPicker>
              </Popover.Content>
            </Popover>
          )}
          <Button
            size="icon"
            type="submit"
            aria-label="Send"
            variant="secondary"
            className="aspect-square text-primary-foreground rounded-full bg-primary size-8 p-2 shrink-0"
            disabled={!canSend || loading || shouldDisable}
          >
            <IconArrowRight />
          </Button>
          <PersistentMenu />
        </div>
      </form>
    </div>
  );
};
