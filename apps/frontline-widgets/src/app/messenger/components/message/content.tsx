import * as React from 'react';
import { IconArrowBackUp } from '@tabler/icons-react';
import { cva } from 'class-variance-authority';
import DOMPurify from 'dompurify';
import { cn } from 'erxes-ui';
import type { MessagePosition, MessageVariant } from '../../types/message';
import { parseQuotedMessage } from '../../utils/quotedMessage';

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

type MessageContentProps = Omit<
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

export function MessageContent({
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
