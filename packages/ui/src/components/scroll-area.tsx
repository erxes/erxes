import * as React from 'react';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { cn } from '../lib/utils';

const ScrollAreaMain = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    scrollBarClassName?: string;
    viewportClassName?: string;
  }
>(
  (
    { className, children, scrollBarClassName, viewportClassName, ...props },
    ref,
  ) => (
    <ScrollAreaPrimitive.Root
      className={cn('relative overflow-hidden', className)}
      ref={ref}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn('h-full w-full rounded-[inherit]', viewportClassName)}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar className={scrollBarClassName} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  ),
);
ScrollAreaMain.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollAreaRoot = React.forwardRef<
  React.ElementRef<typeof ScrollAreaMain>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaMain>
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  />
));

const ScrollAreaViewport = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Viewport
    ref={ref}
    className={cn('h-full w-full rounded-[inherit]', className)}
    {...props}
  />
));

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-px',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-px',
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-scroll" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export const ScrollArea = Object.assign(ScrollAreaMain, {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Bar: ScrollBar,
});
