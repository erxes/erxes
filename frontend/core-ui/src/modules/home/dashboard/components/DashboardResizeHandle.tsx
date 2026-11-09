import { cn } from 'erxes-ui';
import { Ref } from 'react';
import { ResizeHandleAxis } from 'react-grid-layout';

// Hit areas are wider than what they draw, so a resize doesn't need aim.
const HANDLE_CLASS: Partial<Record<ResizeHandleAxis, string>> = {
  e: 'top-0 -right-2 h-full w-4 cursor-ew-resize',
  s: '-bottom-2 left-0 h-4 w-full cursor-ns-resize',
  se: '-bottom-2 -right-2 size-7 cursor-nwse-resize',
};

const GRIP_CLASS: Partial<Record<ResizeHandleAxis, string>> = {
  e: 'h-12 w-1.5',
  s: 'h-1.5 w-12',
  se: 'size-4 rounded-sm border-2 border-background',
};

export const renderDashboardResizeHandle = (
  axis: ResizeHandleAxis,
  ref: Ref<HTMLElement>,
) => (
  <span
    ref={ref as Ref<HTMLSpanElement>}
    className={cn(
      'group/handle absolute z-20 flex items-center justify-center',
      HANDLE_CLASS[axis],
    )}
  >
    <span
      className={cn(
        'rounded-full bg-primary/60 shadow-xs transition-colors group-hover/handle:bg-primary',
        GRIP_CLASS[axis],
      )}
    />
  </span>
);
