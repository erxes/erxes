import React from 'react';
import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from './button';
import { cn } from '../lib/utils';

const SheetHeaderActionsContext = React.createContext<React.ReactNode>(null);

const SheetRoot = ({
  headerActions = null,
  ...props
}: SheetPrimitive.Root.Props & {
  headerActions?: React.ReactNode;
}) => (
  <SheetHeaderActionsContext value={headerActions}>
    <SheetPrimitive.Root {...props} />
  </SheetHeaderActionsContext>
);

const sheetVariants = cva(
  'fixed z-50 shadow-lg outline-hidden ease-in-out data-closed:duration-200 data-open:duration-200 data-open:animate-in data-closed:animate-out data-open:fade-in-0 data-closed:fade-out-0 data-closed:animation-forwards rounded-md bg-muted',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-closed:slide-out-to-top-full data-open:slide-in-from-top-full',
        bottom:
          'inset-x-0 bottom-0 border-t data-closed:slide-out-to-bottom-full data-open:slide-in-from-bottom-full',
        left: 'inset-y-0 left-0 h-full flex flex-col w-3/4 border-r data-closed:slide-out-to-left-full data-open:slide-in-from-left-full sm:max-w-md',
        // Floats 0.5rem in from the viewport's edges, full width on phones.
        right:
          'inset-y-2 right-2 max-sm:left-2 flex flex-col data-closed:slide-out-to-right-full data-open:slide-in-from-right-full overflow-hidden',
      },
      // A right sheet's width from the sm breakpoint.
      size: { md: '', lg: '', xl: '' },
    },
    compoundVariants: [
      { side: 'right', size: 'md', className: 'sm:w-md' },
      { side: 'right', size: 'lg', className: 'sm:w-lg' },
      { side: 'right', size: 'xl', className: 'sm:w-xl' },
    ],
    defaultVariants: {
      side: 'right',
      size: 'md',
    },
  },
);

/** Dims the page under a sheet. View renders one. */
const SheetBackdrop = ({ className, ...props }: SheetPrimitive.Backdrop.Props) => (
  <SheetPrimitive.Backdrop
    forceRender
    className={cn(
      'fixed inset-0 z-50 bg-black/25 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-open:duration-200 data-closed:duration-200 data-closed:animation-forwards',
      className,
    )}
    {...props}
  />
);

/** The backdrop fades in under the panel, which slides in from its side and fades with it. */
const SheetView = ({
  side = 'right',
  size,
  className,
  ...props
}: SheetPrimitive.Popup.Props & VariantProps<typeof sheetVariants>) => (
  <SheetPrimitive.Portal>
    <SheetBackdrop />
    <SheetPrimitive.Popup className={cn(sheetVariants({ side, size }), className)} {...props} />
  </SheetPrimitive.Portal>
);

/** The close icon button in a sheet header. */
const SheetClose = ({ className }: { className?: string }) => {
  const { t } = useTranslation();

  return (
    <SheetPrimitive.Close
      aria-label={t('close', 'Close')}
      render={<Button variant="secondary" size="icon" className={cn('ml-auto', className)} />}
    >
      <IconX />
    </SheetPrimitive.Close>
  );
};

const SheetHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const actions = React.useContext(SheetHeaderActionsContext);
  const items = React.Children.toArray(children);

  const close = actions
    ? items.find((child) => React.isValidElement(child) && child.type === SheetClose)
    : undefined;

  return (
    <div
      className={cn('flex px-5 h-10 items-center bg-background border-b flex-none', className)}
      {...props}
    >
      {actions ? (
        <>
          {items.filter((child) => child !== close)}
          <div className="ml-auto flex shrink-0 items-center gap-1 [&>button]:ml-0">
            {actions}
            {close}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
};

const SheetContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-b-lg bg-background border-b flex-1 px-5 py-4', className)}
    {...props}
  />
);

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-row gap-2 sm:justify-end sm:items-center h-14 px-5', className)}
    {...props}
  />
);

const SheetTitle = ({ className, ...props }: SheetPrimitive.Title.Props) => (
  <SheetPrimitive.Title
    className={cn('text-lg font-semibold text-foreground leading-none', className)}
    {...props}
  />
);

const SheetDescription = ({ className, ...props }: SheetPrimitive.Description.Props) => (
  <SheetPrimitive.Description
    className={cn('text-sm leading-none text-muted-foreground mt-2', className)}
    {...props}
  />
);

export const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetPrimitive.Trigger,
  View: SheetView,
  Backdrop: SheetBackdrop,
  Content: SheetContent,
  Header: SheetHeader,
  Footer: SheetFooter,
  Title: SheetTitle,
  Description: SheetDescription,
  Close: SheetClose,
});
