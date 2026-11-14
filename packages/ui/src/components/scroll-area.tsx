import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const scrollAreaVariants = cva('relative overflow-hidden', {
  variants: {
    // Room along the bottom and right edges, so the scrollbars sit beside the content, not on it.
    gutter: { true: 'pb-2 pr-2' },
  },
});

const ScrollAreaMain = ({
  className,
  children,
  scrollBarClassName,
  viewportClassName,
  gutter,
  ...props
}: ScrollAreaPrimitive.Root.Props &
  VariantProps<typeof scrollAreaVariants> & {
    scrollBarClassName?: string;
    viewportClassName?: string;
  }) => (
  <ScrollAreaPrimitive.Root className={cn(scrollAreaVariants({ gutter }), className)} {...props}>
    <ScrollAreaViewport className={viewportClassName}>{children}</ScrollAreaViewport>
    <ScrollBar className={scrollBarClassName} />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
);

const ScrollAreaRoot = ({
  className,
  gutter,
  ...props
}: ScrollAreaPrimitive.Root.Props & VariantProps<typeof scrollAreaVariants>) => (
  <ScrollAreaPrimitive.Root className={cn(scrollAreaVariants({ gutter }), className)} {...props} />
);

/** Content is laid out as a table at least as wide as the viewport, the way Radix wrapped it. */
const ScrollAreaViewport = ({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.Viewport.Props) => (
  <ScrollAreaPrimitive.Viewport
    className={cn('h-full w-full rounded-[inherit]', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Content style={{ minWidth: '100%', display: 'table' }}>
      {children}
    </ScrollAreaPrimitive.Content>
  </ScrollAreaPrimitive.Viewport>
);

/** Shows while the pointer is over the area or it scrolls, and hides 600ms after, as Radix's hover type did. */
const ScrollBar = ({
  className,
  orientation = 'vertical',
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) => (
  <ScrollAreaPrimitive.Scrollbar
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      'pointer-events-none opacity-0 transition-opacity delay-600 duration-0 data-hovering:pointer-events-auto data-hovering:opacity-100 data-hovering:delay-0 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:delay-0',
      orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-px',
      orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-px',
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-scroll" />
  </ScrollAreaPrimitive.Scrollbar>
);

export const ScrollArea = Object.assign(ScrollAreaMain, {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Bar: ScrollBar,
});
