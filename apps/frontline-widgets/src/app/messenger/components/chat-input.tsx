import { FC, useId, useRef, useState } from 'react';
import {
  IconArrowRight,
  IconFile,
  IconFileSpreadsheet,
  IconFileText,
  IconFileZip,
  IconHeadphones,
  IconLoader2,
  IconMoodSmile,
  IconPaperclip,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  IAttachment,
  Popover,
  readImage,
  useUpload,
} from 'erxes-ui';
import { EmojiPicker } from 'ui-modules/modules/automations/components/EmojiPicker';
import { useAtom } from 'jotai';
import { InitialMessage } from '../constants';
import { connectionAtom } from '../states';
import { useCustomerData } from '../hooks/useCustomerData';
import { useChatInput } from '../hooks/useChatInput';
import { PersistentMenu } from './persistent-menu';
import { useMessenger } from '../hooks/useMessenger';

interface ChatInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

type PendingFile = {
  name: string;
  type: string;
  preview?: string;
};

const FileIcon = ({ type, name }: { type: string; name: string }) => {
  if (
    type.includes('pdf') ||
    type.includes('word') ||
    name.endsWith('.doc') ||
    name.endsWith('.docx')
  )
    return <IconFileText size={16} className="opacity-60" />;
  if (
    type.includes('zip') ||
    type.includes('archive') ||
    name.endsWith('.zip') ||
    name.endsWith('.rar')
  )
    return <IconFileZip size={16} className="opacity-60" />;
  if (type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx'))
    return <IconFileSpreadsheet size={16} className="opacity-60" />;
  if (type.includes('video/'))
    return <IconVideo size={16} className="opacity-60" />;
  if (type.includes('audio/'))
    return <IconHeadphones size={16} className="opacity-60" />;
  return <IconFile size={16} className="opacity-60" />;
};

const AttachmentTile = ({
  children,
  uploading = false,
  onRemove,
}: {
  children: React.ReactNode;
  uploading?: boolean;
  onRemove?: () => void;
}) => (
  <div className="relative shrink-0 group">
    <div
      className={cn(
        'h-14 w-14 rounded-lg overflow-hidden',
        uploading && 'opacity-50',
      )}
    >
      {children}
    </div>
    {uploading && (
      <div className="absolute inset-0 flex items-center justify-center rounded-lg">
        <IconLoader2 size={18} className="text-foreground animate-spin" />
      </div>
    )}
    {!uploading && onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 hidden group-hover:flex bg-background border border-border rounded-full size-4 items-center justify-center shadow-xs hover:bg-destructive hover:border-destructive hover:text-destructive-foreground transition-colors"
      >
        <IconX size={9} />
      </button>
    )}
  </div>
);

const ImageTile = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <img
    src={src}
    alt={alt}
    className={cn(
      'h-14 w-14 object-cover border border-border rounded-lg',
      className,
    )}
  />
);

const FileTile = ({ type, name }: { type: string; name: string }) => (
  <div
    className="h-14 w-14 bg-muted border border-border rounded-lg flex flex-col items-center justify-center gap-1 px-1 overflow-hidden"
    title={name}
  >
    <FileIcon type={type} name={name} />
    <span className="text-[9px] leading-tight text-muted-foreground truncate w-full text-center px-0.5">
      {name}
    </span>
  </div>
);

export const ChatInput: FC<ChatInputProps> = ({ className, ...inputProps }) => {
  const [connection] = useAtom(connectionAtom);
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload } = useUpload();
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
  const isUploading = pendingFiles.length > 0;
  const canSend = (!isDisabled || attachments.length > 0) && !isUploading;

  const totalQueued = attachments.length + pendingFiles.length;
  const uploadedCount = attachments.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    const incoming: PendingFile[] = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined,
    }));

    setPendingFiles((prev) => [...prev, ...incoming]);

    upload({
      files,
      afterUpload: ({ response, fileInfo }) => {
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
          next.splice(idx, 1);
          // revoke the objectURL once upload is done
          if (incoming.find((f) => f.name === fileInfo.name)?.preview) {
            URL.revokeObjectURL(
              incoming.find((f) => f.name === fileInfo.name)!.preview!,
            );
          }
          return next;
        });
      },
    });

    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {attachments.map((att, i) => (
              <AttachmentTile
                key={`done-${att.name}-${i}`}
                onRemove={() => removeAttachment(i)}
              >
                {att.type.startsWith('image/') ? (
                  <ImageTile src={readImage(att.url)} alt={att.name} />
                ) : (
                  <FileTile type={att.type} name={att.name} />
                )}
              </AttachmentTile>
            ))}
            {pendingFiles.map((pf, i) => (
              <AttachmentTile key={`pending-${pf.name}-${i}`} uploading>
                {pf.preview ? (
                  <ImageTile src={pf.preview} alt={pf.name} />
                ) : (
                  <FileTile type={pf.type} name={pf.name} />
                )}
              </AttachmentTile>
            ))}
          </div>
        </div>
      )}

      <form
        className="p-2 flex"
        onSubmit={(e) =>
          handleSubmit(e, {
            attachments,
            onClear: () => setAttachments([]),
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
            placeholder={placeholder}
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
