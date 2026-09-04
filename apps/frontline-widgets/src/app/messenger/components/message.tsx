import {
  IconArrowBackUp,
  IconCheck,
  IconCopy,
  IconDownload,
  IconShare3,
  IconZoomIn,
} from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import DOMPurify from 'dompurify';
import { Avatar, Button, cn, Dialog, readImage, Tooltip } from 'erxes-ui';
import { Slot } from 'radix-ui';
import * as React from 'react';
import { IAttachment } from '../types';
import { formatFileSize, getAttachmentType } from '@libs/format-file';
import { getAttachmentIcon } from './attachment-type';

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
 *
 * Additions:
 *   Message.Row, Message.Body, Message.Author, Message.Attachments,
 *   Message.Time, Message.Tooltip
 */

/* ------------------------------------------------------------------ types -- */

export type MessageVariant = 'incoming' | 'outgoing' | 'bot';

export type MessagePosition = {
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
};

/* ------------------------------------------------------------------- root -- */

const messageVariants = cva('flex flex-col', {
  variants: {
    align: {
      start: 'items-start',
      end: 'items-end ml-auto',
    },
  },
  defaultVariants: { align: 'start' },
});

export type MessageProps = React.ComponentProps<'div'> &
  VariantProps<typeof messageVariants> & { asChild?: boolean };

function MessageRoot({
  className,
  align = 'start',
  asChild = false,
  ...props
}: MessageProps) {
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <Comp
      data-slot="message"
      data-align={align}
      className={cn(messageVariants({ align, className }))}
      {...props}
    />
  );
}

/* ----------------------------------------------------------- row and body -- */

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
      <Avatar.Image src={readImage(src)} alt={alt} />
      <Avatar.Fallback>{fallback}</Avatar.Fallback>
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

function bubbleRadius(
  variant: MessageVariant,
  position: MessagePosition,
  hasAttachments: boolean,
) {
  const { isFirstMessage, isLastMessage, isMiddleMessage, isSingleMessage } =
    position;

  if (variant === 'bot') {
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

type ParsedMessageContent = {
  reply?: {
    author: string;
    preview: string;
  };
  isForwarded?: boolean;
  cleanHtml: string;
};

export function parseQuotedMessage(html?: string): ParsedMessageContent {
  if (!html) return { cleanHtml: '' };

  let cleanHtml = html;
  let reply: { author: string; preview: string } | undefined;
  let isForwarded = false;

  const replyMatch = cleanHtml.match(
    /^<blockquote><strong>Replying to(?:\s+([^<]+))?<\/strong><br\s*\/?>([\s\S]*?)<\/blockquote>/i,
  );

  if (replyMatch) {
    const rawAuthor = replyMatch[1]?.trim() || 'Replying to a message';
    const preview = replyMatch[2]
      ? replyMatch[2]
          .replace(/<[^<>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      : '';
    reply = {
      author: rawAuthor.startsWith('Replying to')
        ? rawAuthor
        : `Replying to ${rawAuthor}`,
      preview,
    };
    cleanHtml = cleanHtml.slice(replyMatch[0].length).trim();
  }

  const forwardMatch = cleanHtml.match(
    /^<blockquote><strong>Forwarded message<\/strong><br\s*\/?>([\s\S]*?)<\/blockquote>/i,
  );

  if (forwardMatch) {
    isForwarded = true;
    cleanHtml = cleanHtml.slice(forwardMatch[0].length).trim();
  } else if (/^(?:<p>)?(?:↪\s*)?Forwarded(?::|\s)/iu.test(cleanHtml)) {
    isForwarded = true;
    cleanHtml = cleanHtml.replace(
      /^(?:<p>)?(?:↪\s*)?Forwarded(?::|\s)*/iu,
      '<p>',
    );
  }

  return { reply, isForwarded, cleanHtml };
}

export type MessageContentProps = Omit<
  React.ComponentProps<'div'>,
  'dangerouslySetInnerHTML' | 'children'
> & {
  variant?: MessageVariant;
  position?: MessagePosition;
  hasAttachments?: boolean;
  html?: string;
  children?: React.ReactNode;
};

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
    const { reply, isForwarded, cleanHtml } = parseQuotedMessage(html);
    const sanitizedHtml = DOMPurify.sanitize(cleanHtml);

    return (
      <div
        data-slot="message-content"
        className={cn(
          classNames,
          (reply || isForwarded) && 'p-0 overflow-hidden',
        )}
        {...props}
      >
        {reply && (
          <div
            className={cn(
              'flex items-center gap-2 border-b px-3 py-2 text-left text-xs transition-colors w-full',
              variant === 'outgoing'
                ? 'border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground'
                : 'border-border/60 bg-muted/60 text-muted-foreground',
            )}
          >
            <IconArrowBackUp className="size-3.5 shrink-0 opacity-80" />
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  'font-medium truncate',
                  variant === 'outgoing'
                    ? 'text-primary-foreground'
                    : 'text-foreground',
                )}
              >
                {reply.author}
              </div>
              {reply.preview && (
                <div className="truncate text-[11px] opacity-80">
                  {reply.preview}
                </div>
              )}
            </div>
          </div>
        )}
        {isForwarded && (
          <div
            className={cn(
              'flex items-center gap-1.5 border-b px-3 py-1.5 text-left text-xs font-medium w-full',
              variant === 'outgoing'
                ? 'border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground/90'
                : 'border-border/60 bg-muted/60 text-muted-foreground',
            )}
          >
            <IconShare3 className="size-3.5 shrink-0" />
            <span>Forwarded</span>
          </div>
        )}
        {Boolean(sanitizedHtml) && (
          <div
            className={cn('w-full', (reply || isForwarded) && 'px-3 py-2')}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cleanHtml) }}
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

export const hasMessageContent = (
  content?: string | null,
): content is string => {
  if (!content) return false;
  if (/<blockquote[\s\S]*?<\/blockquote>/i.test(content)) return true;
  return Boolean(content.replace(/<[^>]*>/g, '').replace(/\s|&nbsp;/g, ''));
};

/* ----------------------------------------------------------- attachments -- */

export type MessageAttachmentsProps = {
  attachments?: IAttachment[];
  align?: 'start' | 'end';
};

function AttachmentImage({ attachment }: { attachment: IAttachment }) {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group relative block max-w-72 overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-xs transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {/* skipcq: JS-W1015 */}
          <img
            src={readImage(attachment.url)}
            alt={attachment.name || 'Photo'}
            loading="lazy"
            className="max-h-64 w-full rounded-2xl object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-xs">
              <IconZoomIn className="size-3.5" />
              <span>Click to preview</span>
            </span>
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="!flex !h-auto !max-h-[90vh] !w-auto !max-w-[90vw] items-center justify-center !overflow-hidden !border-0 !bg-black/90 !p-2 shadow-2xl [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20">
        {/* skipcq: JS-W1015 */}
        <img
          src={readImage(attachment.url)}
          alt={attachment.name || 'Photo preview'}
          className="block max-h-[85vh] max-w-[88vw] rounded-lg object-contain"
        />
      </Dialog.Content>
    </Dialog>
  );
}

function AttachmentVideo({ attachment }: { attachment: IAttachment }) {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group relative flex max-w-72 items-center gap-2 overflow-hidden rounded-2xl border border-border/60 bg-black/80 p-2 text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <video
            src={readImage(attachment.url)}
            muted
            className="max-h-40 w-full rounded-xl object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-xs">
              <IconZoomIn className="size-3.5" />
              <span>Play video</span>
            </span>
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="!flex !h-auto !max-h-[90vh] !w-auto !max-w-[90vw] items-center justify-center !overflow-hidden !border-0 !bg-black/90 !p-2 shadow-2xl [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20">
        <video
          src={readImage(attachment.url)}
          controls
          autoPlay
          playsInline
          className="block max-h-[85vh] max-w-[88vw] rounded-lg object-contain"
        />
      </Dialog.Content>
    </Dialog>
  );
}

function AttachmentFile({ attachment }: { attachment: IAttachment }) {
  const IconComponent = getAttachmentIcon(
    getAttachmentType(attachment.type, attachment.name),
  );

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group relative flex w-fit max-w-full min-w-44 items-center gap-2.5 rounded-xl border border-border/70 bg-card p-2 text-left text-card-foreground shadow-2xs transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
            <IconComponent className="size-5" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-semibold">
              {attachment.name || 'File'}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              {formatFileSize(attachment?.size || 0) || 'Attachment'} · Click to
              preview
            </span>
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-sm rounded-2xl p-5">
        <Dialog.Header>
          <Dialog.Title className="truncate text-base">
            {attachment.name || 'File'}
          </Dialog.Title>
        </Dialog.Header>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
            <IconComponent className="size-7" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {attachment.name || 'Attachment'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatFileSize(attachment?.size || 0)}
            </p>
          </div>
          <a
            href={readImage(attachment.url)}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            <IconDownload className="size-3.5" />
            Download file
          </a>
        </div>
      </Dialog.Content>
    </Dialog>
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
        'flex flex-col gap-1.5 mt-1 w-full',
        align === 'end' ? 'items-end' : 'items-start',
      )}
    >
      {attachments.map((attachment, index) => {
        const isImage = attachment.type?.startsWith('image');
        const isVideo = attachment.type?.startsWith('video');
        const isAudio = attachment.type?.startsWith('audio');
        const key = `${attachment.url}-${index}`;

        if (isImage) {
          return <AttachmentImage key={key} attachment={attachment} />;
        }

        if (isVideo) {
          return <AttachmentVideo key={key} attachment={attachment} />;
        }

        if (isAudio) {
          return (
            <audio
              key={key}
              src={readImage(attachment.url)}
              controls
              className="w-full min-w-56"
            />
          );
        }

        return <AttachmentFile key={key} attachment={attachment} />;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ time -- */

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
  onCopy?: () => void;
  align?: 'start' | 'end';
};

export function MessageItemActions({
  onReply,
  onCopy,
  align = 'start',
}: MessageItemActionsProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (!onReply && !onCopy) return null;

  return (
    <div
      className={cn(
        'opacity-0 group-hover/message:opacity-100 focus-within:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 rounded-lg border border-border/60 bg-background/95 p-0.5 shadow-2xs backdrop-blur-xs shrink-0 self-center',
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
            className="size-6 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Reply"
          >
            <IconArrowBackUp className="size-3.5" />
          </Button>
        </MessageTooltip>
      )}
      {onCopy && (
        <MessageTooltip label={copied ? 'Copied!' : 'Copy'}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="size-6 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Copy"
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
