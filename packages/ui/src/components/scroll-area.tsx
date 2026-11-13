import React from 'react';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { cn } from '../lib/utils';

const ScrollAreaMain = ({
  ref,
  className,
  children,
  scrollBarClassName,
  viewportClassName,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  scrollBarClassName?: string;
  viewportClassName?: string;
}) => (
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
);

const ScrollAreaRoot = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaMain>) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  />
);

const ScrollAreaViewport = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>) => (
  <ScrollAreaPrimitive.Viewport
    ref={ref}
    className={cn('h-full w-full rounded-[inherit]', className)}
    {...props}
  />
);

const ScrollBar = ({
  ref,
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-px',
      orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-px',
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-scroll" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
);

export const ScrollArea = Object.assign(ScrollAreaMain, {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Bar: ScrollBar,
});
