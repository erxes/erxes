import { FC, useEffect, useId, useRef, useState } from 'react';
import {
  IconArrowBackUp,
  IconArrowRight,
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
import { PreviewImage } from './message';

type ChatInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  replyTo?: {
    authorName: string;
    content: string;
  } | null;
  onCancelReply?: () => void;
};

/** A file still in flight. It leaves this list only once the upload settles. */
type PendingFile = {
  name: string;
  type: string;
  size: number;
  /** Object URL for image previews — revoked when the entry is dropped. */
  preview?: string;
  state: 'uploading' | 'error';
  /** Why it failed, when known. */
  error?: string;
};

const DEFAULT_MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

/** Same limit `useUpload` enforces, read per call so a late env write counts. */
const getMaxUploadSize = (): number =>
  Number.parseInt(
    localStorage.getItem('erxes_env_REACT_APP_FILE_UPLOAD_MAX_SIZE') || '',
    10,
  ) || DEFAULT_MAX_UPLOAD_SIZE;

const toPendingFile = (
  file: File,
  state: PendingFile['state'],
): PendingFile => ({
  name: file.name,
  type: file.type,
  size: file.size,
  preview: file.type.startsWith('image/')
    ? URL.createObjectURL(file)
    : undefined,
  state,
});

function DoneAttachmentTrigger({
  att,
  index,
  onRemove,
}: {
  att: IAttachment;
  index: number;
  onRemove: (index: number) => void;
}) {
  const fileType = getAttachmentType(att.type, att.name);
  const FileTypeIcon = getAttachmentIcon(fileType);
  const isImage = fileType === 'image';

  return (
    <Attachment
      size="sm"
      state="done"
      className="relative cursor-pointer transition-all hover:bg-muted/60"
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 text-left focus-visible:outline-none"
        >
          {isImage ? (
            <Attachment.Media variant="image">
              <PreviewImage src={readImage(att.url)} alt={att.name} />
            </Attachment.Media>
          ) : (
            <Attachment.Media>
              <FileTypeIcon />
            </Attachment.Media>
          )}
          <Attachment.Content>
            <Attachment.Title>{att.name}</Attachment.Title>
            <Attachment.Description>
              {`${formatFileSize(att.size || 0)} · Click to preview`}
            </Attachment.Description>
          </Attachment.Content>
        </button>
      </Dialog.Trigger>
      <Attachment.Actions>
        <Attachment.Action
          type="button"
          aria-label={`Remove ${att.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
        >
          <IconX />
        </Attachment.Action>
      </Attachment.Actions>
    </Attachment>
  );
}

function DoneAttachmentPreview({ att }: { att: IAttachment }) {
  const fileType = getAttachmentType(att.type, att.name);
  const FileTypeIcon = getAttachmentIcon(fileType);
  const isImage = fileType === 'image';

  return (
    <Dialog.Content className="max-w-2xl rounded-2xl">
      <Dialog.Header>
        <Dialog.Title className="truncate">{att.name}</Dialog.Title>
      </Dialog.Header>
      {isImage ? (
        <div className="flex items-center justify-center p-2">
          <PreviewImage
            src={readImage(att.url)}
            alt={att.name}
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
            <FileTypeIcon className="size-7" />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(att.size || 0)}
          </p>
        </div>
      )}
    </Dialog.Content>
  );
}

function DoneAttachmentItem({
  att,
  index,
  onRemove,
}: {
  att: IAttachment;
  index: number;
  onRemove: (index: number) => void;
}) {
  return (
    <Dialog>
      <DoneAttachmentTrigger att={att} index={index} onRemove={onRemove} />
      <DoneAttachmentPreview att={att} />
    </Dialog>
  );
}

export const ChatInput: FC<ChatInputProps> = ({
  className,
  replyTo,
  onCancelReply,
  ...inputProps
}) => {
  const [connection] = useAtom(connectionAtom);
  const [atomReplyTo, setAtomReplyTo] = useAtom(widgetReplyToAtom);
  const activeReplyTo = replyTo !== undefined ? replyTo : atomReplyTo;
  const handleCancelReply = () => {
    onCancelReply?.();
    setAtomReplyTo(null);
  };
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Names dismissed mid-flight — the request cannot be aborted, so its late
   *  response has to be dropped instead of silently re-attaching the file. */
  const cancelledUploadsRef = useRef<Set<string>>(new Set());
  const {
    upload,
    isLoading: isUploadRunning,
    status: uploadStatus,
  } = useUpload();
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

  const handleDisabledClick = () => {
    if (shouldDisable) switchToTab('messages');
  };

  // `useUpload` reports a rejected file (bad type, upload config, network) only
  // through `status` — it raises its own toast and returns without calling
  // `afterUpload`, so nothing else ever settles the tile. Once the uploader
  // stops with a failed status, whatever is still marked uploading has failed.
  useEffect(() => {
    if (isUploadRunning || uploadStatus) return;

    setPendingFiles((prev) =>
      prev.some((file) => file.state === 'uploading')
        ? prev.map((file) =>
            file.state === 'uploading'
              ? { ...file, state: 'error' as const }
              : file,
          )
        : prev,
    );
  }, [isUploadRunning, uploadStatus]);
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

    const acceptedFiles = new DataTransfer();
    accepted.forEach((file) => acceptedFiles.items.add(file));

    upload({
      files: acceptedFiles.files,
      // Only reached for files the server accepted; the effect above owns the
      // failures, which never call back at all.
      afterUpload: ({ response, fileInfo }) => {
        if (cancelledUploadsRef.current.delete(fileInfo.name)) return;

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
          const idx = prev.findIndex((f) => f.name === fileInfo.name);
          if (idx === -1) return prev;
          const next = [...prev];
          const [uploaded] = next.splice(idx, 1);
          // revoke the objectURL once upload is done
          if (uploaded.preview) {
            URL.revokeObjectURL(uploaded.preview);
          }
          return next;
        });
      },
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const dismissPendingFile = (index: number) => {
    setPendingFiles((prev) => {
      const dismissed = prev[index];
      if (!dismissed) return prev;
      if (dismissed.state === 'uploading') {
        cancelledUploadsRef.current.add(dismissed.name);
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
            {attachments.map((att, i) => (
              <DoneAttachmentItem
                key={`done-${att.url}`}
                att={att}
                index={i}
                onRemove={removeAttachment}
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
                      {hasFailed ? pf.error || 'Upload failed' : 'Uploading'}
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

      {activeReplyTo && (
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground animate-in fade-in-50">
          <div className="flex items-center gap-2 min-w-0">
            <IconArrowBackUp className="size-3.5 text-primary shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold text-foreground">
                Replying to {activeReplyTo.authorName}:{' '}
              </span>
              <span className="truncate">{activeReplyTo.content}</span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={handleCancelReply}
            aria-label="Cancel reply"
          >
            <IconX className="size-3" />
          </Button>
        </div>
      )}

      <form
        className="p-2 flex"
        onSubmit={(e) => {
          let outgoingContent: string | undefined;
          if (activeReplyTo) {
            outgoingContent = `<blockquote><strong>Replying to ${activeReplyTo.authorName}</strong><br/>${activeReplyTo.content}</blockquote>${message}`;
          }
          handleSubmit(e, {
            attachments,
            contentOverride: outgoingContent,
            onClear: () => {
              setAttachments([]);
              handleCancelReply();
            },
          });
        }}
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
              >
                <IconPaperclip className="size-4 text-muted-foreground shrink-0 group-hover:text-primary dark:group-hover:text-primary-foreground transition-all" />
              </Button>
            </>
          )}
          <input
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
