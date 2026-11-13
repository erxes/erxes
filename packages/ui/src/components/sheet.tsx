import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from './button';
import { cn } from '../lib/utils';

const SheetTrigger = ({ ref, ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) => (
  <SheetPrimitive.Trigger ref={ref} {...props} />
);

const SheetHeaderActionsContext = React.createContext<React.ReactNode>(null);

const SheetRoot = ({
  headerActions = null,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root> & {
  headerActions?: React.ReactNode;
}) => (
  <SheetHeaderActionsContext.Provider value={headerActions}>
    <SheetPrimitive.Root {...props} />
  </SheetHeaderActionsContext.Provider>
);

const SheetOverlay = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/25 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-200 data-[state=closed]:duration-200 data-[state=closed]:[animation-fill-mode:forwards]',
      className,
    )}
    {...props}
    ref={ref}
  />
);

const sheetVariants = cva(
  'fixed z-50 shadow-lg outline-hidden ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:[animation-fill-mode:forwards] rounded-md bg-muted',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full',
        left: 'inset-y-0 left-0 h-full flex flex-col w-3/4 border-r data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full sm:max-w-md',
        right:
          'inset-y-2 right-2 flex flex-col h-[calc(100dvh-1rem)] w-[calc(100vw-(--spacing(4)))] md:w-3/4 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full overflow-hidden sm:max-w-md',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

const SheetPortal = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Portal>) => (
  <SheetPrimitive.Portal {...props} />
);

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetView = ({
  ref,
  side = 'right',
  className,
  children,
  ...props
}: SheetContentProps & React.RefAttributes<React.ComponentRef<typeof SheetPrimitive.Content>>) => (
  <SheetPortal>
    <SheetOverlay>
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetOverlay>
  </SheetPortal>
);

const SheetClose = ({
  ref,
  asChild,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) => {
  const { t } = useTranslation();

  if (asChild) {
    return <SheetPrimitive.Close ref={ref} {...props} asChild />;
  }

  return (
    <SheetPrimitive.Close ref={ref} aria-label={t('close', 'Close')} {...props} asChild>
      <Button variant="secondary" size="icon" className={cn('ml-auto', props.className)}>
        <IconX />
      </Button>
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
  <div className={cn('rounded-b-lg bg-background border-b flex-1', className)} {...props} />
);

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-row sm:justify-end sm:items-center sm:space-x-2 h-14 px-5', className)}
    {...props}
  />
);

const SheetTitle = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground leading-none', className)}
    {...props}
  />
);

const SheetDescription = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm leading-none text-muted-foreground mt-2', className)}
    {...props}
  />
);

export const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Overlay: SheetOverlay,
  View: SheetView,
  Content: SheetContent,
  Header: SheetHeader,
  Footer: SheetFooter,
  Title: SheetTitle,
  Description: SheetDescription,
  Close: SheetClose,
});
