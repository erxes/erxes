import { IconExternalLink, IconFile } from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import DOMPurify from 'dompurify';
import { Avatar, Button, cn, readImage, Tooltip } from 'erxes-ui';
import { Slot } from 'radix-ui';
import * as React from 'react';
import { IAttachment } from '../types';
import { formatFileSize, getAttachmentType } from '@libs/format-file';
import { Attachment } from './attachment';
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

const isImageAttachment = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);

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
    return (
      <div
        data-slot="message-content"
        className={classNames}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        {...props}
      />
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
  !!content && content !== '<p></p>';

/* ----------------------------------------------------------- attachments -- */

const attachmentVariants = cva('overflow-hidden aspect-square', {
  variants: {
    variant: {
      incoming: 'bg-background',
      bot: 'bg-background',
      outgoing: 'bg-accent',
    },
  },
  defaultVariants: { variant: 'incoming' },
});

const attachmentLinkVariants = cva(
  'flex flex-col items-center gap-0.5 px-3 py-2 transition-colors truncate',
  {
    variants: {
      variant: {
        incoming: 'hover:bg-accent/50',
        bot: 'hover:bg-accent/50',
        outgoing: 'hover:bg-accent/70',
      },
    },
    defaultVariants: { variant: 'incoming' },
  },
);

export type MessageAttachmentsProps = {
  attachments?: IAttachment[];
};

function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments?.length) return null;

  if (attachments?.length > 2) {
    return (
      <div data-slot="message-attachments" className="max-w-72">
        <Attachment.Group className="border pt-2 px-3 pb-0 rounded-2xl hide-scroll styled-scroll">
          {attachments.map((attachment, index) => {
            const fileType = getAttachmentType(
              attachment.type,
              attachment.name,
            );
            const IconComponent = getAttachmentIcon(fileType);
            return (
              <Attachment
                key={`${attachment.url}-${index}`}
                orientation={'vertical'}
              >
                {attachment.type?.startsWith('image') ? (
                  <Attachment.Media variant={'image'}>
                    <img
                      src={readImage(attachment.url)}
                      alt={attachment.name}
                    />
                  </Attachment.Media>
                ) : (
                  <Attachment.Media>
                    <IconComponent />
                  </Attachment.Media>
                )}
                <Attachment.Content>
                  <Attachment.Title>{attachment.name}</Attachment.Title>
                  <Attachment.Description>
                    {getAttachmentType(attachment.type, attachment.name)} ·{' '}
                    {formatFileSize(attachment?.size || 0)}
                  </Attachment.Description>
                </Attachment.Content>
                <Attachment.Trigger asChild>
                  <a
                    href={readImage(attachment.url)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${attachment.name}`}
                  />
                </Attachment.Trigger>
              </Attachment>
            );
          })}
        </Attachment.Group>
      </div>
    );
  }
  return (
    <div data-slot="message-attachments" className="space-y-1">
      {attachments.map((attachment, index) => {
        const fileType = getAttachmentType(attachment.type, attachment.name);
        const IconComponent = getAttachmentIcon(fileType);
        return (
          <Attachment
            key={`${attachment.url}-${index}`}
            className="place-self-end"
          >
            {attachment.type?.startsWith('image') ? (
              <Attachment.Media variant={'image'}>
                <img src={readImage(attachment.url)} alt={attachment.name} />
              </Attachment.Media>
            ) : (
              <Attachment.Media>
                <IconComponent />
              </Attachment.Media>
            )}
            <Attachment.Content>
              <Attachment.Title>{attachment.name}</Attachment.Title>
              <Attachment.Description>
                {getAttachmentType(attachment.type)} ·{' '}
                {formatFileSize(attachment?.size || 0)}
              </Attachment.Description>
            </Attachment.Content>
            <Attachment.Trigger asChild>
              <a
                href={readImage(attachment.url)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${attachment.name}`}
              />
            </Attachment.Trigger>
          </Attachment>
        );
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
});
