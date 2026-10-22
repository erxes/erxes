import {
  Icon,
  IconChevronDown,
  IconChevronLeft,
  IconMaximize,
  IconX,
} from '@tabler/icons-react';
import { Button, cn, DropdownMenu, Tabs } from 'erxes-ui';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export interface IRecordSidePanelTab {
  value: string;
  label: string;
  icon: Icon;
  content: React.ReactNode;
}

// A record shown beside its list, the list staying usable: a header and tabs.
export const SIDE_PANEL_WIDTH = { min: 320, max: 600, default: 400 };

const clampWidth = (width: number, maxWidth: number) =>
  Math.min(maxWidth, Math.max(SIDE_PANEL_WIDTH.min, width));

// Dragging the panel's left edge resizes it; leftwards makes it wider.
const RecordSidePanelResizeHandle = ({
  width,
  maxWidth,
  onWidthChange,
}: {
  width: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [dragging, setDragging] = useState(false);
  const stopResize = useRef<((commit?: boolean) => void) | null>(null);
  const onWidthChangeRef = useRef(onWidthChange);
  onWidthChangeRef.current = onWidthChange;
  useEffect(() => () => stopResize.current?.(false), []);
  useEffect(() => {
    stopResize.current?.();
  }, [maxWidth]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault();
    stopResize.current?.();
    const handle = event.currentTarget;
    const panel = handle.parentElement;
    if (!panel) return;
    const doc = handle.ownerDocument;
    const view = doc.defaultView;
    if (!view) return;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startWidth = panel.getBoundingClientRect().width || width;
    let nextWidth = startWidth;
    let frame: number | null = null;
    const previousCursor = doc.body.style.cursor;
    const previousUserSelect = doc.body.style.userSelect;

    // Paint locally while dragging; the storage-backed owner only commits once.
    const paint = () => {
      frame = null;
      panel.style.width = `${nextWidth}px`;
      handle.setAttribute('aria-valuenow', String(nextWidth));
    };
    const stop = (commit = true) => {
      if (stopResize.current !== stop) return;
      stopResize.current = null;
      if (frame !== null) view.cancelAnimationFrame(frame);
      doc.removeEventListener('pointermove', move, true);
      doc.removeEventListener('pointerup', end, true);
      doc.removeEventListener('pointercancel', end, true);
      doc.removeEventListener('visibilitychange', visibilityChanged);
      doc.removeEventListener('keydown', keyDown, true);
      handle.removeEventListener('lostpointercapture', end);
      view.removeEventListener('blur', blur);
      if (handle.hasPointerCapture?.(pointerId))
        handle.releasePointerCapture(pointerId);
      doc.body.style.cursor = previousCursor;
      doc.body.style.userSelect = previousUserSelect;
      if (commit) {
        paint();
        setDragging(false);
        if (nextWidth !== startWidth) onWidthChangeRef.current(nextWidth);
      }
    };
    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      // Recover even when the browser/OS never delivered the release event.
      if ((moveEvent.buttons & 1) === 0) {
        stop();
        return;
      }
      nextWidth = clampWidth(startWidth + startX - moveEvent.clientX, maxWidth);
      if (frame === null) frame = view.requestAnimationFrame(paint);
    };
    const end = (endEvent: PointerEvent) => {
      if (endEvent.pointerId === pointerId) stop();
    };
    const blur = () => stop();
    const visibilityChanged = () => {
      if (doc.visibilityState === 'hidden') stop();
    };
    const keyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') {
        keyEvent.preventDefault();
        keyEvent.stopPropagation();
        stop();
      }
    };

    stopResize.current = stop;
    doc.body.style.cursor = 'col-resize';
    doc.body.style.userSelect = 'none';
    doc.addEventListener('pointermove', move, true);
    doc.addEventListener('pointerup', end, true);
    doc.addEventListener('pointercancel', end, true);
    doc.addEventListener('visibilitychange', visibilityChanged);
    doc.addEventListener('keydown', keyDown, true);
    handle.addEventListener('lostpointercapture', end);
    view.addEventListener('blur', blur);
    handle.setPointerCapture?.(pointerId);
    setDragging(true);
  };

  return (
    <>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t('resize', 'Resize side panel')}
        aria-valuemin={SIDE_PANEL_WIDTH.min}
        aria-valuemax={maxWidth}
        aria-valuenow={width}
        tabIndex={0}
        title={t('drag-to-resize', 'Drag to resize')}
        data-resizing={dragging || undefined}
        className="group absolute inset-y-0 -left-2 z-10 flex w-4 cursor-col-resize touch-none items-center justify-center outline-none after:absolute after:inset-y-0 after:w-px after:bg-transparent hover:after:bg-primary/50 focus-visible:after:bg-primary data-[resizing=true]:after:bg-primary"
        onPointerDown={handlePointerDown}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 64 : 16;
          const widths: Record<string, number> = {
            ArrowLeft: width + step,
            ArrowRight: width - step,
            Home: SIDE_PANEL_WIDTH.min,
            End: maxWidth,
          };
          const nextWidth = widths[event.key];
          if (nextWidth === undefined) return;
          event.preventDefault();
          onWidthChange(clampWidth(nextWidth, maxWidth));
        }}
      >
        <span className="relative z-10 h-10 w-1 rounded-full bg-border transition-colors group-hover:bg-primary/60 group-focus-visible:bg-primary group-data-[resizing=true]:bg-primary" />
      </div>
      {dragging &&
        createPortal(
          // Keep embedded reports from swallowing pointer events during a resize.
          <div
            aria-hidden="true"
            data-side-panel-resize-shield
            className="fixed inset-0 z-50 cursor-col-resize touch-none select-none"
          />,
          document.body,
        )}
    </>
  );
};

// A record shown beside its list, the list staying usable: a header and tabs.
const RecordSidePanelRoot = ({
  className,
  width = SIDE_PANEL_WIDTH.default,
  maxWidth = SIDE_PANEL_WIDTH.max,
  onWidthChange,
  children,
}: {
  className?: string;
  width?: number;
  // Larger surfaces can opt in without widening record panels.
  maxWidth?: number;
  // Makes the panel resizable from its left edge.
  onWidthChange?: (width: number) => void;
  children: React.ReactNode;
}) => {
  const upperBound = Math.max(SIDE_PANEL_WIDTH.min, maxWidth);
  const panelWidth = clampWidth(width, upperBound);
  return (
    <aside
      style={{ width: panelWidth }}
      className={cn(
        'relative flex flex-col flex-none max-w-full min-h-0 border-l bg-background transition-none',
        // Animate entry only: duration-200 must never ease drag width changes.
        'animate-in fade-in-0 slide-in-from-right-8 duration-200 ease-out motion-reduce:animate-none',
        className,
      )}
    >
      {onWidthChange && (
        <RecordSidePanelResizeHandle
          width={panelWidth}
          maxWidth={upperBound}
          onWidthChange={onWidthChange}
        />
      )}
      {children}
    </aside>
  );
};

const RecordSidePanelHeader = ({
  avatar,
  title,
  actions,
  onBack,
  onExpand,
  onClose,
}: {
  // Shown when the panel came here from another record.
  onBack?: () => void;
  avatar?: React.ReactNode;
  title: React.ReactNode;
  // The record's own actions (e.g. a "more" menu), before expand and close.
  actions?: React.ReactNode;
  onExpand?: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    // Same height and surface as the app's top bar, so the two read as one.
    <div className="flex items-center gap-1 h-12 px-2 border-b bg-sidebar flex-none">
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 flex-none"
          onClick={onBack}
          title={t('back', 'Back')}
          aria-label={t('back', 'Back')}
        >
          <IconChevronLeft className="size-4" />
        </Button>
      )}
      {avatar}
      <div className="flex-1 min-w-0 px-1 text-sm font-medium truncate">
        {title}
      </div>
      {actions && (
        <div className="flex flex-none items-center gap-1">{actions}</div>
      )}
      {onExpand && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onExpand}
          title={t('expand', 'Open full view')}
        >
          <IconMaximize className="size-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={onClose}
        title={t('close', 'Close')}
      >
        <IconX className="size-4" />
      </Button>
    </div>
  );
};

/**
 * The first `visibleCount` tabs show as triggers; the rest sit behind a
 * "+N More" menu. A tab picked from the menu takes the last visible slot.
 */
// Tab bar layout, in px: the gap between triggers, the "+N More" button, and
// a tab's width before it was ever shown.
const TAB_GAP = 4;
const MORE_BUTTON_WIDTH = 96;
const TAB_FALLBACK_WIDTH = 104;

const RecordSidePanelTabs = ({
  tabs,
  value,
  onValueChange,
  visibleCount = 3,
}: {
  tabs: IRecordSidePanelTab[];
  value: string;
  onValueChange: (value: string) => void;
  visibleCount?: number;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const barRef = useRef<HTMLDivElement>(null);
  const tabWidths = useRef(new Map<string, number>());
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const tabsKey = tabs.map((tab) => tab.value).join(',');
  // How many tabs fit the bar beside the More button; never more than
  // `visibleCount`. A narrow panel moves the rest into More.
  const [fitCount, setFitCount] = useState(visibleCount);

  const measure = useCallback(() => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    bar
      .querySelectorAll<HTMLElement>('[data-panel-tab]')
      .forEach((trigger) =>
        tabWidths.current.set(
          trigger.dataset.panelTab || '',
          trigger.offsetWidth,
        ),
      );

    const candidates = tabsRef.current.slice(0, visibleCount);
    const widths = candidates.map(
      (tab) => tabWidths.current.get(tab.value) ?? TAB_FALLBACK_WIDTH,
    );
    const style = getComputedStyle(bar);
    const available =
      bar.clientWidth -
      (parseFloat(style.paddingLeft) || 0) -
      (parseFloat(style.paddingRight) || 0);
    const total =
      widths.reduce((sum, width) => sum + width, 0) +
      TAB_GAP * (widths.length - 1);
    const needsMore =
      tabsRef.current.length > visibleCount || total > available;
    const budget = needsMore ? available - MORE_BUTTON_WIDTH : available;

    let used = 0;
    let count = 0;

    for (const width of widths) {
      const next = used + (count ? TAB_GAP : 0) + width;

      if (next > budget) {
        break;
      }

      used = next;
      count += 1;
    }

    setFitCount(Math.max(1, count));
  }, [visibleCount]);

  useLayoutEffect(() => {
    const bar = barRef.current;

    measure();

    if (!bar || typeof ResizeObserver === 'undefined') {
      return;
    }

    let frame = 0;
    // Measured in the next frame, outside the observer callback.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });

    observer.observe(bar);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure, tabsKey]);

  const shownCount = Math.min(visibleCount, fitCount);

  // Tabs shown for the first time are measured once drawn; their real width
  // then settles the count (each width is measured once, so it converges).
  useLayoutEffect(() => {
    measure();
  }, [shownCount, measure]);
  const activeIndex = tabs.findIndex((tab) => tab.value === value);
  const visible =
    activeIndex >= shownCount
      ? [...tabs.slice(0, shownCount - 1), tabs[activeIndex]]
      : tabs.slice(0, shownCount);
  const overflow = tabs.filter((tab) => !visible.includes(tab));

  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className="flex flex-col flex-1 min-h-0 min-w-0"
    >
      {/* Lines up with a page's breadcrumb row: h-10 plus its 1px rule. */}
      {/* Never wider than its container: pinning a tab moves tabs into More
          instead of widening whatever holds the panel. */}
      <div
        ref={barRef}
        className="box-content flex items-center gap-1 h-10 px-2 border-b bg-background flex-none min-w-0 overflow-hidden"
      >
        <Tabs.List className="flex h-full min-w-0 items-stretch border-b-0 gap-1 py-0">
          {visible.map((tab) => (
            // Full row height, so the active underline lands on the row's
            // bottom border instead of above it.
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              data-panel-tab={tab.value}
              className="h-full gap-1.5 rounded-none after:-mb-px"
            >
              <tab.icon className="size-4" />
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {overflow.length > 0 && (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-accent-foreground"
              >
                {t('more', '+{{count}} More', { count: overflow.length })}
                <IconChevronDown />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              {overflow.map((tab) => (
                <DropdownMenu.Item
                  key={tab.value}
                  onSelect={() => onValueChange(tab.value)}
                >
                  <tab.icon />
                  {tab.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
      </div>
      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.value}
          value={tab.value}
          // A widget's own header lines up with a page's filter row (37px).
          // A quick fade when switching tabs or opening another record.
          className="flex-1 min-h-0 data-[state=active]:flex flex-col [&_[data-side-menu-header]]:h-9 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-150 motion-reduce:animate-none"
        >
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs>
  );
};

export const RecordSidePanel = Object.assign(RecordSidePanelRoot, {
  Header: RecordSidePanelHeader,
  Tabs: RecordSidePanelTabs,
});
