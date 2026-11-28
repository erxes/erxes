import React from 'react';
import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from './button';
import { findFirstField } from '../hooks/use-focus-first-field';
import { cn, mergeRefs } from '../lib/utils';

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
      // A right sheet's width from the sm breakpoint. The wide ones (3.x's sheet widths) fill
      // the viewport below md and three quarters of it from md, up to their size.
      size: { md: '', lg: '', xl: '', '2xl': '', '5xl': '', '6xl': '', '7xl': '' },
    },
    compoundVariants: [
      { side: 'right', size: 'md', className: 'sm:w-md' },
      { side: 'right', size: 'lg', className: 'sm:w-lg' },
      { side: 'right', size: 'xl', className: 'sm:w-xl' },
      { side: 'right', size: '2xl', className: 'w-sheet md:w-3/4 sm:max-w-2xl' },
      { side: 'right', size: '5xl', className: 'w-sheet md:w-3/4 sm:max-w-5xl' },
      { side: 'right', size: '6xl', className: 'w-sheet md:w-3/4 sm:max-w-6xl' },
      { side: 'right', size: '7xl', className: 'w-sheet md:w-3/4 sm:max-w-7xl' },
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

/**
 * The backdrop fades in under the panel, which slides in from its side and fades with it.
 * It opens with the cursor in its first field, when it has one.
 */
const SheetView = ({
  ref,
  side = 'right',
  size,
  className,
  initialFocus,
  ...props
}: SheetPrimitive.Popup.Props & VariantProps<typeof sheetVariants>) => {
  const popupRef = React.useRef<HTMLDivElement>(null);

  return (
    <SheetPrimitive.Portal>
      <SheetBackdrop />
      <SheetPrimitive.Popup
        ref={mergeRefs(popupRef, ref)}
        initialFocus={initialFocus ?? (() => findFirstField(popupRef.current) ?? true)}
        className={cn(sheetVariants({ side, size }), className)}
        {...props}
      />
    </SheetPrimitive.Portal>
  );
};

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

  // The title and the close button share the first line; a visible description wraps to its own
  // line under them, so neither is squeezed on a phone.
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 px-5 py-2 min-h-10 bg-background border-b flex-none',
        className,
      )}
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

const sheetContentVariants = cva('rounded-b-lg bg-background flex-1 min-h-0 overflow-y-auto', {
  variants: {
    inset: {
      default: 'px-5 py-4',
      /** 1rem all round (3.x's form sheets). */
      sm: 'p-4',
      /** None: the content draws its own, as a list with a bar above it. */
      none: '',
    },
    /** The rule under the content; `false` when a ruled-off section follows it. */
    divider: { true: 'border-b', false: '' },
  },
  defaultVariants: { inset: 'default', divider: true },
});

const SheetContent = ({
  className,
  inset,
  divider,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sheetContentVariants>) => (
  <div className={cn(sheetContentVariants({ inset, divider }), className)} {...props} />
);

const sheetFooterVariants = cva('flex flex-row sm:justify-end sm:items-center h-14', {
  variants: {
    variant: {
      default: 'gap-2 px-5',
      /** Ruled off from the content above, 1rem in (3.x's chooser). */
      divided: 'border-t p-4 gap-2 sm:gap-4',
      /** A tight bar on the sheet's muted ground (3.x's pick-a-voucher sheet). */
      compact: 'bg-muted p-2.5 gap-1 sm:gap-3',
    },
  },
  defaultVariants: { variant: 'default' },
});

const SheetFooter = ({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sheetFooterVariants>) => (
  <div data-save-bar className={cn(sheetFooterVariants({ variant }), className)} {...props} />
);

const SheetTitle = ({ className, ...props }: SheetPrimitive.Title.Props) => (
  <SheetPrimitive.Title
    className={cn('min-w-0 flex-1 text-lg font-semibold text-foreground leading-tight', className)}
    {...props}
  />
);

const sheetDescriptionVariants = cva('order-last basis-full text-sm leading-snug', {
  variants: {
    /** `destructive` while what it counts is out of bounds (more owners than the line holds). */
    tone: { default: 'text-muted-foreground', destructive: 'text-destructive-text' },
  },
  defaultVariants: { tone: 'default' },
});

const SheetDescription = ({
  className,
  tone,
  ...props
}: SheetPrimitive.Description.Props & VariantProps<typeof sheetDescriptionVariants>) => (
  <SheetPrimitive.Description
    className={cn(sheetDescriptionVariants({ tone }), className)}
    {...props}
  />
);

/**
 * A panel that slides in from a page edge over a dimmed page.
 * A plugin's records open in core's side panel through `useOpenRecord`, never in a Sheet.
 */
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
