import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar, cn, readImage } from 'erxes-ui';
import { Slot } from 'radix-ui';

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

type MessageRootProps = React.ComponentProps<'div'> &
  VariantProps<typeof messageVariants> & { asChild?: boolean };

/** forwardRef is required: Radix `Tooltip.Trigger asChild` hands a ref down,
 *  and this project is on React 18 where ref-as-prop does not apply. */
export const MessageRoot = React.forwardRef<HTMLDivElement, MessageRootProps>(
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
export const MessageRow = React.forwardRef<
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

export function MessageBody({
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

type MessageAvatarProps = {
  /** `false` renders an equally sized spacer so grouped bubbles stay aligned. */
  show?: boolean;
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  /** Renders an icon/logo instead of an image avatar (used by BotMessage). */
  children?: React.ReactNode;
};

export function MessageAvatar({
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

export function MessageAuthor({
  className,
  ...props
}: React.ComponentProps<'span'>) {
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
