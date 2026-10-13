import * as React from 'react';
import { IconArrowBackUp, IconCheck, IconCopy } from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import { Button, cn, Tooltip } from 'erxes-ui';

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

type MessageTimeProps = Omit<
  React.ComponentProps<'time'>,
  'dateTime' | 'children'
> &
  VariantProps<typeof messageTimeVariants> & { date: Date };

/**
 * Renders a semantic `<time>` so assistive tech gets the exact timestamp
 * without depending on the hover tooltip (which is pointer-only).
 */
export function MessageTime({
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

type MessageTooltipProps = {
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
export function MessageTooltip({
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
export function MessageTimestampTooltip({
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

export function MessageActions({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-actions"
      className={cn('flex flex-wrap gap-1.5 mt-1.5 pl-10', className)}
      {...props}
    />
  );
}

/** prompt-kit's `MessageAction`: an interactive control plus its tooltip. */
export const MessageAction = MessageTooltip;

type MessageItemActionsProps = {
  onReply?: () => void;
  onCopy?: () => void | Promise<void>;
  align?: 'start' | 'end';
};

export function MessageItemActions({
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
