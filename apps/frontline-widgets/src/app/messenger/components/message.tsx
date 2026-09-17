import {
  IconArrowBackUp,
  IconCheck,
  IconCopy,
  IconZoomIn,
  IconX,
  type IconProps,
} from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import DOMPurify from 'dompurify';
import { PreviewImage } from './preview-image';
import { Avatar, Button, cn, Dialog, readImage, Tooltip } from 'erxes-ui';
import { Slot } from 'radix-ui';
import * as React from 'react';
import { IAttachment } from '../types';
import { formatFileSize, getAttachmentType } from '@libs/format-file';
import { getAttachmentIcon } from './attachment-type';
import { downloadAttachmentFile } from '../utils/fileUpload';

/**
 * Compound message primitives, modelled on prompt-kit's `Message` /
 * `MessageContent` / `MessageAvatar` / `MessageActions` / `MessageAction`
 * slots, but expressed with this app's local idiom (see `bot-marker.tsx`):
 * `cva` variants + `Slot.Root` for `asChild` + `data-slot` + a compound
 * `Object.assign` export.
 *
 * Slot mapping from prompt-kit:
 *   Message         -> Message           (root; `align` replaces `isOwnMessage`)
 *   MessageAvatar   -> Message.Avatar    (adds `show` for grouped messages)
 *   MessageContent  -> Message.Content   (`html` replaces `markdown`)
 *   MessageActions  -> Message.Actions
 *   MessageAction   -> Message.Action
 * Added because this widget needs them and prompt-kit has no equivalent:
 *   Message.Row, Message.Body, Message.Author, Message.Attachments,
 *   Message.Time, Message.Tooltip
 *
 * Every class string below is lifted verbatim from the previous inline markup
 * in `conversation.tsx`, so the rendered design tokens are unchanged.
 */

/**
 * Position of a message inside its time/author group. Note these overlap: a
 * lone message in a group is simultaneously first, last and single. The radius
 * helpers below therefore preserve the *original* `cn()` ordering, because
 * tailwind-merge resolves the overlap by last-one-wins.
 */
export type MessagePosition = {
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
};

export type MessageVariant = 'incoming' | 'outgoing' | 'bot';

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return 'just now';
  if (minutes < 5) return 'few minutes ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours} hours ago`;
  return format(date, 'MMM dd, yyyy, HH:mm');
};

/* ------------------------------------------------------------------ root -- */

const messageVariants = cva('flex flex-col', {
  variants: {
    /** `align="end"` is the old `isOwnMessage` — the customer's own bubbles. */
    align: {
      start: 'mr-auto max-w-[80%]',
      end: 'items-end ml-auto max-w-[70%]',
    },
  },
  defaultVariants: { align: 'start' },
});

export type MessageRootProps = React.ComponentProps<'div'> &
  VariantProps<typeof messageVariants> & { asChild?: boolean };

/** forwardRef is required: Radix `Tooltip.Trigger asChild` hands a ref down,
 *  and this project is on React 18 where ref-as-prop does not apply. */
const MessageRoot = React.forwardRef<HTMLDivElement, MessageRootProps>(
  ({ className, align = 'start', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'div';

    return (
      <Comp
        ref={ref}
        data-slot="message"
        data-align={align}
        className={cn(messageVariants({ align, className }))}
        {...props}
      />
    );
  },
);
MessageRoot.displayName = 'Message';

/** Avatar + body row. Kept separate from the root so that action rows can sit
 *  outside it — which is what keeps them out of the tooltip trigger. */
const MessageRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="message-row"
    className={cn('flex items-end justify-start gap-2', className)}
    {...props}
  />
));
MessageRow.displayName = 'Message.Row';

const messageBodyVariants = cva('flex flex-col', {
  variants: {
    align: {
      start: 'gap-0.5 flex-1',
      end: 'gap-2 w-fit',
    },
  },
  defaultVariants: { align: 'start' },
});

function MessageBody({
  className,
  align = 'start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof messageBodyVariants>) {
  return (
    <div
      data-slot="message-body"
      className={cn(messageBodyVariants({ align, className }))}
      {...props}
    />
  );
}

/* ---------------------------------------------------------------- avatar -- */

export type MessageAvatarProps = {
  /** `false` renders an equally sized spacer so grouped bubbles stay aligned. */
  show?: boolean;
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  /** Renders an icon/logo instead of an image avatar (used by BotMessage). */
  children?: React.ReactNode;
};

function MessageAvatar({
  show = true,
  src,
  alt,
  fallback = 'C',
  className,
  children,
}: MessageAvatarProps) {
  if (!show) {
    return (
      <div
        data-slot="message-avatar-spacer"
        aria-hidden="true"
        className={cn('size-8 shrink-0', className)}
      />
    );
  }

  if (children) {
    return (
      <div
        data-slot="message-avatar"
        className={cn('size-8 shrink-0', className)}
      >
        {children}
      </div>
    );
  }

  return (
    <Avatar
      data-slot="message-avatar"
      className={cn('size-8 shrink-0', className)}
    >
      <Avatar.Image
        src={readImage(src)}
        className="shrink-0 object-cover"
        alt={alt}
      />
      <Avatar.Fallback className="bg-background">{fallback}</Avatar.Fallback>
    </Avatar>
  );
}

/* ---------------------------------------------------------------- author -- */

function MessageAuthor({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="message-author"
      className={cn(
        'text-[11px] text-muted-foreground px-1 font-medium',
        className,
      )}
      {...props}
    />
  );
}

/* --------------------------------------------------------------- content -- */

const messageContentVariants = cva(
  'h-auto flex flex-col justify-start items-start text-left gap-1 px-3 py-2',
  {
    variants: {
      variant: {
        incoming:
          'font-normal text-sm leading-snug text-foreground/85 bg-background whitespace-break-spaces wrap-break-word break-all',
        bot: 'font-normal text-sm leading-snug text-foreground/85 bg-background whitespace-break-spaces wrap-break-word text-pretty',
        outgoing:
          'font-medium text-[13px] leading-relaxed bg-primary text-primary-foreground',
      },
    },
    defaultVariants: { variant: 'incoming' },
  },
);

/**
 * Corner-radius + shadow rules, transcribed 1:1 from the previous inline
 * `cn()` chains. Order is significant — do not "tidy" these into a switch.
 */
function bubbleRadius(
  variant: MessageVariant,
  position: MessagePosition,
  hasAttachments: boolean,
) {
  const { isFirstMessage, isLastMessage, isMiddleMessage, isSingleMessage } =
    position;

  if (variant === 'bot') {
    // The bot bubble never renders attachments, so there is no attached case.
    return cn(
      isSingleMessage && 'rounded-2xl rounded-bl-sm shadow-sm',
      isFirstMessage && 'rounded-2xl rounded-b-sm shadow-2xs',
      isMiddleMessage && 'rounded-sm shadow-2xs',
      isLastMessage && 'rounded-2xl rounded-bl-sm rounded-t-sm shadow-2xs',
      isLastMessage &&
        isSingleMessage &&
        'rounded-2xl rounded-bl-sm shadow-2xs',
    );
  }

  if (variant === 'outgoing') {
    return cn(
      !hasAttachments && isSingleMessage && 'rounded-2xl shadow-sm',
      !hasAttachments && isFirstMessage && 'rounded-2xl rounded-br-sm',
      !hasAttachments &&
        isMiddleMessage &&
        'rounded-2xl rounded-tr-sm rounded-br-sm',
      !hasAttachments && isLastMessage && 'rounded-2xl rounded-tr-sm shadow-sm',
      hasAttachments && (isSingleMessage || isFirstMessage) && 'rounded-t-2xl',
      hasAttachments &&
        (isMiddleMessage || isLastMessage) &&
        'rounded-tl-2xl rounded-tr-sm',
    );
  }

  return cn(
    !hasAttachments && isSingleMessage && 'rounded-2xl rounded-bl-sm shadow-sm',
    !hasAttachments && isFirstMessage && 'rounded-2xl rounded-b-sm shadow-2xs',
    !hasAttachments && isMiddleMessage && 'rounded-sm shadow-2xs',
    !hasAttachments &&
      isLastMessage &&
      'rounded-2xl rounded-l-sm rounded-tr-sm shadow-2xs',
    !hasAttachments &&
      isSingleMessage &&
      isFirstMessage &&
      'rounded-2xl rounded-bl-sm shadow-2xs',
    hasAttachments &&
      (isSingleMessage || isFirstMessage) &&
      'rounded-t-2xl rounded-bl-sm shadow-sm',
    hasAttachments &&
      (isMiddleMessage || isLastMessage) &&
      'rounded-tr-2xl rounded-bl-sm rounded-tl-sm',
  );
}

export type MessageContentProps = Omit<
  React.ComponentProps<'div'>,
  'dangerouslySetInnerHTML' | 'children'
> & {
  variant?: MessageVariant;
  position?: MessagePosition;
  hasAttachments?: boolean;
  /**
   * Replaces prompt-kit's `markdown` prop. The API returns HTML, so this
   * sanitises with DOMPurify rather than pulling in a markdown renderer.
   * Mutually exclusive with `children`.
   */
  html?: string;
  children?: React.ReactNode;
};

type ParsedMessageContent = {
  reply?: {
    author: string;
    preview: string;
  };
  cleanHtml: string;
};

function SanitizedHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const parsed = new DOMParser().parseFromString(
      DOMPurify.sanitize(html),
      'text/html',
    );
    ref.current.replaceChildren(...Array.from(parsed.body.childNodes));
  }, [html]);

  return <div ref={ref} className={className} />;
}

export function parseQuotedMessage(html?: string): ParsedMessageContent {
  if (!html) return { cleanHtml: '' };

  const replyMatch = html.match(
    /^<blockquote><strong>Replying to(?:\s+([^<]+))?<\/strong><br\s*\/?>([\s\S]*?)<\/blockquote>/i,
  );

  if (!replyMatch) return { cleanHtml: html };

  return {
    reply: {
      author: replyMatch[1]?.trim() || 'a message',
      preview: replyMatch[2]
        .replace(/<[^<>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    },
    cleanHtml: html.slice(replyMatch[0].length).trim(),
  };
}

function MessageContent({
  className,
  variant = 'incoming',
  position = {},
  hasAttachments = false,
  html,
  children,
  ...props
}: MessageContentProps) {
  const classNames = cn(
    messageContentVariants({ variant }),
    bubbleRadius(variant, position, hasAttachments),
    className,
  );

  if (html !== undefined) {
    const { reply, cleanHtml } = parseQuotedMessage(html);
    return (
      <div
        data-slot="message-content"
        className={cn(classNames, reply && 'overflow-hidden p-0')}
        {...props}
      >
        {reply && (
          <div
            className={cn(
              'flex w-full items-center gap-2 border-b px-3 py-2 text-left text-xs',
              variant === 'outgoing'
                ? 'border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground'
                : 'border-border/60 bg-muted/60 text-muted-foreground',
            )}
          >
            <IconArrowBackUp className="size-3.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                Replying to {reply.author}
              </div>
              {reply.preview && (
                <div className="truncate text-[11px] opacity-80">
                  {reply.preview}
                </div>
              )}
            </div>
          </div>
        )}
        {cleanHtml && (
          <SanitizedHtml
            html={cleanHtml}
            className={cn('w-full', reply && 'px-3 py-2')}
          />
        )}
      </div>
    );
  }

  return (
    <div data-slot="message-content" className={classNames} {...props}>
      {children}
    </div>
  );
}

/** `true` when the API sent an empty rich-text document. */
export const hasMessageContent = (content?: string | null): content is string =>
  !!content &&
  (/<blockquote[\s\S]*?<\/blockquote>/i.test(content) ||
    Boolean(content.replace(/<[^>]*>/g, '').replace(/\s|&nbsp;/g, '')));

/* ----------------------------------------------------------- attachments -- */

export type MessageAttachmentsProps = {
  attachments?: IAttachment[];
  align?: 'start' | 'end';
};

function PreviewDialogClose() {
  return (
    <Dialog.Close asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 z-10 bg-background/80"
        aria-label="Close attachment preview"
      >
        <IconX />
      </Button>
    </Dialog.Close>
  );
}

type PreviewTriggerProps = {
  attachment: IAttachment;
  name: string;
} & React.ComponentProps<'button'>;

/** forwardRef + prop spreading are required: Radix `Dialog.Trigger asChild`
 *  injects its open-toggle `onClick` (and ref) into this component, and any
 *  prop that is not forwarded never reaches the underlying button — which is
 *  exactly why the preview previously never opened. */
const ImagePreviewTrigger = React.forwardRef<
  HTMLButtonElement,
  PreviewTriggerProps
>(({ attachment, name, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    {...props}
    className="group relative block max-w-72 overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    aria-label={`Preview ${name}`}
  >
    <PreviewImage
      src={readImage(attachment.url)}
      alt={name}
      className="max-h-64 w-full rounded-2xl object-cover"
    />
    <span className="absolute inset-0 hidden items-center justify-center bg-black/25 transition-opacity group-hover:flex group-focus-visible:flex [@media(hover:hover)]:flex [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
      <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
        <IconZoomIn className="size-3.5" />
        Preview
      </span>
    </span>
  </button>
));
ImagePreviewTrigger.displayName = 'ImagePreviewTrigger';

function ImagePreviewContent({
  attachment,
  name,
}: {
  attachment: IAttachment;
  name: string;
}) {
  return (
    <Dialog.Content className="flex! h-auto! max-h-[90vh]! w-auto! max-w-[90vw]! items-center justify-center overflow-hidden! border-0! bg-black/90! p-2!">
      <Dialog.Title className="sr-only">{name}</Dialog.Title>
      <Dialog.Description className="sr-only">
        Full-size image preview
      </Dialog.Description>
      <PreviewImage
        src={readImage(attachment.url)}
        alt={name}
        fit="contain"
        className="block max-h-[85vh] max-w-[88vw] rounded-lg object-contain"
      />
      <PreviewDialogClose />
    </Dialog.Content>
  );
}

function AttachmentImage({ attachment }: { attachment: IAttachment }) {
  const name = attachment.name || 'Image';

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <ImagePreviewTrigger attachment={attachment} name={name} />
      </Dialog.Trigger>
      <ImagePreviewContent attachment={attachment} name={name} />
    </Dialog>
  );
}

const VideoPreviewTrigger = React.forwardRef<
  HTMLButtonElement,
  PreviewTriggerProps
>(({ attachment, name, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    {...props}
    className="group relative flex max-w-72 items-center overflow-hidden rounded-2xl border border-border/60 bg-black/80 p-2 text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    aria-label={`Play ${name}`}
  >
    <video
      src={readImage(attachment.url)}
      muted
      playsInline
      preload="metadata"
      className="max-h-40 w-full rounded-xl object-contain"
    />
    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
      <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
        <IconZoomIn className="size-3.5" />
        Play video
      </span>
    </span>
  </button>
));
VideoPreviewTrigger.displayName = 'VideoPreviewTrigger';

function VideoPreviewContent({
  attachment,
  name,
}: {
  attachment: IAttachment;
  name: string;
}) {
  return (
    <Dialog.Content className="flex! h-auto! max-h-[90vh]! w-auto! max-w-[90vw]! items-center justify-center overflow-hidden! border-0! bg-black/90! p-2!">
      <Dialog.Title className="sr-only">{name}</Dialog.Title>
      <Dialog.Description className="sr-only">
        Video attachment preview
      </Dialog.Description>
      <video
        src={readImage(attachment.url)}
        controls
        autoPlay
        playsInline
        className="block max-h-[85vh] max-w-[88vw] rounded-lg object-contain"
      />
      <PreviewDialogClose />
    </Dialog.Content>
  );
}

function AttachmentVideo({ attachment }: { attachment: IAttachment }) {
  const name = attachment.name || 'Video';

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <VideoPreviewTrigger attachment={attachment} name={name} />
      </Dialog.Trigger>
      <VideoPreviewContent attachment={attachment} name={name} />
    </Dialog>
  );
}

function AttachmentFile({ attachment }: { attachment: IAttachment }) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const name = attachment.name || 'File';
  const IconComponent: React.FC<IconProps> = getAttachmentIcon(
    getAttachmentType(attachment.type, attachment.name),
  );

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadAttachmentFile(readImage(attachment.url), name);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex w-fit max-w-full min-w-44 items-center gap-2.5 rounded-xl border border-border/70 bg-card p-2 text-left text-card-foreground shadow-2xs transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-wait disabled:opacity-70"
      aria-label={`Download ${name}`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
        <IconComponent className="size-5" />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-xs font-semibold">{name}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
          {formatFileSize(attachment.size || 0)} ·{' '}
          {isDownloading ? 'Downloading…' : 'Download'}
        </span>
      </span>
    </button>
  );
}

function MessageAttachments({
  attachments,
  align = 'start',
}: MessageAttachmentsProps) {
  if (!attachments?.length) return null;

  return (
    <div
      data-slot="message-attachments"
      className={cn(
        'mt-1 flex w-full flex-col gap-1.5',
        align === 'end' ? 'items-end' : 'items-start',
      )}
    >
      {attachments.map((attachment, index) => {
        const key = `${attachment.url}-${index}`;
        const fileType = getAttachmentType(attachment.type, attachment.name);

        if (fileType === 'image') {
          return <AttachmentImage key={key} attachment={attachment} />;
        }
        if (fileType === 'video') {
          return <AttachmentVideo key={key} attachment={attachment} />;
        }
        if (fileType === 'audio') {
          return (
            <audio
              key={key}
              src={readImage(attachment.url)}
              controls
              preload="metadata"
              className="w-full min-w-56 max-w-72"
              aria-label={attachment.name || 'Audio attachment'}
            />
          );
        }
        return <AttachmentFile key={key} attachment={attachment} />;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ time -- */

const messageTimeVariants = cva('text-[10px] text-muted-foreground mt-0.5', {
  variants: {
    align: {
      start: 'px-1',
      end: 'pr-0.5',
    },
  },
  defaultVariants: { align: 'start' },
});

export type MessageTimeProps = Omit<
  React.ComponentProps<'time'>,
  'dateTime' | 'children'
> &
  VariantProps<typeof messageTimeVariants> & { date: Date };

/**
 * Renders a semantic `<time>` so assistive tech gets the exact timestamp
 * without depending on the hover tooltip (which is pointer-only).
 */
function MessageTime({
  className,
  align = 'start',
  date,
  ...props
}: MessageTimeProps) {
  return (
    <time
      data-slot="message-time"
      dateTime={date.toISOString()}
      className={cn(messageTimeVariants({ align, className }))}
      {...props}
    >
      {formatRelativeTime(date)}
    </time>
  );
}

/* --------------------------------------------------------------- tooltip -- */

export type MessageTooltipProps = {
  label: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  delayDuration?: number;
};

/**
 * prompt-kit's `MessageAction` generalised: a tooltip whose trigger is the
 * child via `asChild`. Wrap only non-interactive content with it — nesting
 * buttons, links or form fields inside a tooltip trigger breaks keyboard and
 * screen-reader semantics.
 */
function MessageTooltip({
  label,
  side = 'top',
  delayDuration,
  children,
}: MessageTooltipProps) {
  return (
    <Tooltip.Provider>
      {/*
        Spread rather than `delayDuration={delayDuration}`: erxes-ui's Tooltip
        root defaults to 0, and passing an explicit `undefined` would override
        that default back to Radix's 700ms.
      */}
      <Tooltip {...(delayDuration === undefined ? {} : { delayDuration })}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Content side={side}>{label}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
}

/** Convenience wrapper for the common "absolute timestamp on hover" case. */
function MessageTimestampTooltip({
  date,
  children,
  ...props
}: Omit<MessageTooltipProps, 'label'> & { date: Date }) {
  return (
    <MessageTooltip label={format(date, 'MMM dd, yyyy hh:mm aa')} {...props}>
      {children}
    </MessageTooltip>
  );
}

/* --------------------------------------------------------------- actions -- */

function MessageActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-actions"
      className={cn('flex flex-wrap gap-1.5 mt-1.5 pl-10', className)}
      {...props}
    />
  );
}

/** prompt-kit's `MessageAction`: an interactive control plus its tooltip. */
const MessageAction = MessageTooltip;

export type MessageItemActionsProps = {
  onReply?: () => void;
  onCopy?: () => void | Promise<void>;
  align?: 'start' | 'end';
};

function MessageItemActions({
  onReply,
  onCopy,
  align = 'start',
}: MessageItemActionsProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!onCopy) return;

    try {
      await onCopy();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (!onReply && !onCopy) return null;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-0.5 self-center rounded-lg border border-border/60 bg-background/95 p-0.5 shadow-2xs transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/message:opacity-100',
        align === 'end' ? 'mr-1' : 'ml-1',
      )}
    >
      {onReply && (
        <MessageTooltip label="Reply">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onReply}
            className="size-6 rounded-md text-muted-foreground"
            aria-label="Reply to message"
          >
            <IconArrowBackUp className="size-3.5" />
          </Button>
        </MessageTooltip>
      )}
      {onCopy && (
        <MessageTooltip label={copied ? 'Copied' : 'Copy'}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="size-6 rounded-md text-muted-foreground"
            aria-label="Copy message"
          >
            {copied ? (
              <IconCheck className="size-3.5 text-primary" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
          </Button>
        </MessageTooltip>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- export -- */

export const Message = Object.assign(MessageRoot, {
  Row: MessageRow,
  Body: MessageBody,
  Avatar: MessageAvatar,
  Author: MessageAuthor,
  Content: MessageContent,
  Attachments: MessageAttachments,
  Time: MessageTime,
  Tooltip: MessageTooltip,
  TimestampTooltip: MessageTimestampTooltip,
  Actions: MessageActions,
  Action: MessageAction,
  ItemActions: MessageItemActions,
});
