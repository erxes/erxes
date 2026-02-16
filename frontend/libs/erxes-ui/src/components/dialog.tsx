import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { cn } from '../lib/utils';
import { Button } from './button';
import { IconX } from '@tabler/icons-react';

export type DialogProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Root
>;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 grid place-items-center z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 backdrop-blur-xs',
      'duration-200 ease-out',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'duration-200 ease-out will-change-transform',
          'sm:rounded-lg outline-hidden',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogOverlay>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogCombinedHeader = ({
  title,
  description,
  hideClose,
}: {
  title: string;
  description: string;
  hideClose?: boolean;
}) => (
  <Dialog.Header>
    <Dialog.Title>{title}</Dialog.Title>
    <Dialog.Description className="sr-only">{description}</Dialog.Description>
    {!hideClose && (
      <Dialog.Close asChild>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-3"
        >
          <IconX />
        </Button>
      </Dialog.Close>
    )}
  </Dialog.Header>
);

const DialogContentCombined = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
  React.ComponentPropsWithoutRef<typeof DialogCombinedHeader>
>(({ className, children, title, description, hideClose, ...props }, ref) => (
  <DialogContent ref={ref} className={cn(className)} {...props}>
    <DialogCombinedHeader
      title={title}
      description={description}
      hideClose={hideClose}
    />
    {children}
  </DialogContent>
));

DialogContentCombined.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-accent-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export const Dialog = Object.assign(DialogPrimitive.Root, {
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Trigger: DialogTrigger,
  Close: DialogClose,
  Content: DialogContent,
  HeaderCombined: DialogCombinedHeader,
  ContentCombined: DialogContentCombined,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
});
