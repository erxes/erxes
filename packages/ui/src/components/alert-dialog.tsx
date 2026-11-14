import React, { createContext, use, useRef, type RefObject } from 'react';

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { buttonVariants } from './button';
import { cn } from '../lib/utils';

// Cancel takes focus when the dialog opens, unless the content names another element.
const CancelRefContext = createContext<RefObject<HTMLButtonElement | null> | null>(null);

const AlertDialogContent = ({
  className,
  initialFocus,
  ...props
}: AlertDialogPrimitive.Popup.Props) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <CancelRefContext value={cancelRef}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Backdrop
          forceRender
          className="fixed inset-0 z-50 bg-black/80 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0"
        />
        <AlertDialogPrimitive.Popup
          initialFocus={initialFocus ?? cancelRef}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-closed:slide-out-to-top-1/2 data-open:slide-in-from-top-1/2 sm:rounded-lg',
            className,
          )}
          {...props}
        />
      </AlertDialogPrimitive.Portal>
    </CancelRefContext>
  );
};

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);

const AlertDialogTitle = ({ className, ...props }: AlertDialogPrimitive.Title.Props) => (
  <AlertDialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />
);

const AlertDialogDescription = ({
  className,
  ...props
}: AlertDialogPrimitive.Description.Props) => (
  <AlertDialogPrimitive.Description
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);

/** Both buttons close the dialog; Action is the primary one. */
const AlertDialogAction = ({ className, ...props }: AlertDialogPrimitive.Close.Props) => (
  <AlertDialogPrimitive.Close className={cn(buttonVariants(), className)} {...props} />
);

const AlertDialogCancel = ({ className, ...props }: AlertDialogPrimitive.Close.Props) => (
  <AlertDialogPrimitive.Close
    ref={use(CancelRefContext)}
    className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}
    {...props}
  />
);

export const AlertDialog = Object.assign(AlertDialogPrimitive.Root, {
  Action: AlertDialogAction,
  Cancel: AlertDialogCancel,
  Content: AlertDialogContent,
  Description: AlertDialogDescription,
  Footer: AlertDialogFooter,
  Header: AlertDialogHeader,
  Title: AlertDialogTitle,
  Trigger: AlertDialogPrimitive.Trigger,
});
