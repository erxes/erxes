import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const scrollAreaVariants = cva('relative flex flex-col overflow-hidden', {
  variants: {
    /**
     * Room along the edges, so the scrollbars sit beside the content, not on it: `true` along
     * the bottom and right, `wide` more of it (3.x's line tables), `bottom` only under it, for a
     * box that scrolls only across.
     */
    gutter: { true: 'pb-2 pr-2', wide: 'pb-3 pr-3', bottom: 'pb-3' },
  },
});

type FitWidth = {
  /**
   * The content stays as wide as the box, so a long line wraps or truncates instead of widening
   * every row. For a box that scrolls only down, such as a record panel.
   */
  fitWidth?: boolean;
};

const ScrollAreaMain = ({
  className,
  children,
  scrollBarClassName,
  viewportClassName,
  gutter,
  fitWidth,
  ...props
}: ScrollAreaPrimitive.Root.Props &
  VariantProps<typeof scrollAreaVariants> &
  FitWidth & {
    scrollBarClassName?: string;
    viewportClassName?: string;
  }) => (
  <ScrollAreaPrimitive.Root className={cn(scrollAreaVariants({ gutter }), className)} {...props}>
    <ScrollAreaViewport className={viewportClassName} fitWidth={fitWidth}>
      {children}
    </ScrollAreaViewport>
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

/** The scrolling box. Its content is at least as wide as its widest line, unless `fitWidth`. */
const ScrollAreaViewport = ({
  className,
  children,
  fitWidth,
  ...props
}: ScrollAreaPrimitive.Viewport.Props & FitWidth) => (
  <ScrollAreaPrimitive.Viewport
    className={cn('h-full min-h-0 w-full rounded-inherit', className)}
    {...props}
  >
    {/* Base UI sets the content's min-width to fit-content inline; only `!` overrides it. */}
    <ScrollAreaPrimitive.Content className={cn(fitWidth && 'min-w-0!')}>
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

/** A scrolling box with thin scrollbars that show on hover or scroll. */
export const ScrollArea = Object.assign(ScrollAreaMain, {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Bar: ScrollBar,
});
