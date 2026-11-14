import React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { cn } from '../lib/utils';
import { Button } from './button';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/** Dims the page under a dialog. Content renders one; a hand-built popup in `Dialog.Portal` uses this. */
const DialogBackdrop = ({ className, ...props }: DialogPrimitive.Backdrop.Props) => (
  <DialogPrimitive.Backdrop
    forceRender
    className={cn(
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-xs data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 duration-200 ease-out',
      className,
    )}
    {...props}
  />
);

/** The backdrop dims the page and the viewport centers the popup; a press on either closes the dialog. */
const DialogContent = ({ className, ...props }: DialogPrimitive.Popup.Props) => (
  <DialogPrimitive.Portal>
    <DialogBackdrop />
    <DialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center">
      <DialogPrimitive.Popup
        className={cn(
          'grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg',
          'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0',
          'duration-200 ease-out will-change-transform',
          'sm:rounded-lg outline-hidden',
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Viewport>
  </DialogPrimitive.Portal>
);

const DialogCombinedHeader = ({
  title,
  description,
  hideClose,
}: {
  title: string;
  description: string;
  hideClose?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description className="sr-only">{description}</Dialog.Description>
      {!hideClose && (
        <DialogPrimitive.Close
          aria-label={t('close', 'Close')}
          render={<Button variant="secondary" size="icon" className="absolute right-4 top-3" />}
        >
          <IconX />
        </DialogPrimitive.Close>
      )}
    </Dialog.Header>
  );
};

const DialogContentCombined = ({
  children,
  title,
  description,
  hideClose,
  ...props
}: DialogPrimitive.Popup.Props & React.ComponentProps<typeof DialogCombinedHeader>) => (
  <DialogContent {...props}>
    <DialogCombinedHeader title={title} description={description} hideClose={hideClose} />
    {children}
  </DialogContent>
);

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2', className)}
    {...props}
  />
);

const DialogTitle = ({ className, ...props }: DialogPrimitive.Title.Props) => (
  <DialogPrimitive.Title
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
);

const DialogDescription = ({ className, ...props }: DialogPrimitive.Description.Props) => (
  <DialogPrimitive.Description
    className={cn('text-sm text-accent-foreground', className)}
    {...props}
  />
);

export const Dialog = Object.assign(DialogPrimitive.Root, {
  Trigger: DialogPrimitive.Trigger,
  Close: DialogPrimitive.Close,
  Portal: DialogPrimitive.Portal,
  Backdrop: DialogBackdrop,
  Content: DialogContent,
  HeaderCombined: DialogCombinedHeader,
  ContentCombined: DialogContentCombined,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
});
