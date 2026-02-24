import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { IconX } from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from './button';
import { cn } from '../lib/utils';

const SheetTrigger = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger>
>(({ ...props }, ref) => <SheetPrimitive.Trigger ref={ref} {...props} />);
SheetTrigger.displayName = SheetPrimitive.Trigger.displayName;

const SheetRoot = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>) => (
  <SheetPrimitive.Root {...props} />
);
SheetRoot.displayName = SheetPrimitive.Root.displayName;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/25  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 shadow-lg outline-hidden transition ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out rounded-md bg-muted',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full flex flex-col w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-md',
        right:
          'inset-y-2 right-2 flex flex-col h-[calc(100dvh-1rem)] w-[calc(100vw-(--spacing(4)))] md:w-3/4 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right overflow-hidden sm:max-w-md',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

export const SheetPortal = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Portal>) => (
  <SheetPrimitive.Portal {...props} />
);

SheetPortal.displayName = SheetPrimitive.Portal.displayName;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetView = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
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
));
SheetView.displayName = SheetPrimitive.Content.displayName;

export const SheetClose = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close>
>(({ asChild, ...props }, ref) => {
  if (asChild) {
    return <SheetPrimitive.Close ref={ref} {...props} asChild />;
  }

  return (
    <SheetPrimitive.Close ref={ref} {...props} asChild>
      <Button
        variant="secondary"
        size="icon"
        className={cn('ml-auto', props.className)}
      >
        <IconX />
      </Button>
    </SheetPrimitive.Close>
  );
});
SheetClose.displayName = SheetPrimitive.Close.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex px-5 h-14 items-center bg-background border-b flex-none',
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

const SheetContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-b-lg bg-background border-b flex-1', className)}
    {...props}
  />
);
SheetContent.displayName = 'SheetContent';

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-row sm:justify-end sm:items-center sm:space-x-2 h-14 px-5',
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold text-foreground leading-none',
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm leading-none text-muted-foreground mt-2', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

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
