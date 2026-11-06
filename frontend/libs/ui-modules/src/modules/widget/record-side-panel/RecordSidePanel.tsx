import type {
  PanelExpansionContextValue,
  RecordSidePanelResizeHandleProps,
  RecordSidePanelRootProps,
  RecordSidePanelHeaderProps,
  RecordSidePanelTabsProps,
} from 'ui-modules/modules/widget/record-side-panel/RecordSidePanelTypes';
import {
  IconChevronDown,
  IconChevronLeft,
  IconMaximize,
  IconMinimize,
  IconX,
} from '@tabler/icons-react';
import { Button, cn, DropdownMenu, Tabs } from 'erxes-ui';
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export type { IRecordSidePanelTab } from 'ui-modules/modules/widget/record-side-panel/RecordSidePanelTypes';

// A record shown beside its list, the list staying usable: a header and tabs.
export const SIDE_PANEL_WIDTH = { min: 320, max: 600, default: 400 };

/** Keeps a resized pane within its configured width limits. */
const clampWidth = (width: number, maxWidth: number) =>
  Math.min(maxWidth, Math.max(SIDE_PANEL_WIDTH.min, width));

const PanelExpansionContext = createContext<PanelExpansionContextValue>(null);

/** Reads the expansion state of the nearest record panel. */
export const usePanelExpanded = () =>
  useContext(PanelExpansionContext)?.expanded ?? false;

// Dragging the panel's left edge resizes it; leftwards makes it wider.
const RecordSidePanelResizeHandle = ({
  width,
  maxWidth,
  onWidthChange,
}: RecordSidePanelResizeHandleProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [dragging, setDragging] = useState(false);
  const stopResize = useRef<((commit?: boolean) => void) | null>(null);
  const onWidthChangeRef = useRef(onWidthChange);
  onWidthChangeRef.current = onWidthChange;
  useEffect(() => () => stopResize.current?.(false), []);
  useEffect(() => {
    stopResize.current?.();
  }, [maxWidth]);

  /** Starts a pointer-specific resize and commits its final width once. */
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault();
    stopResize.current?.();
    const handle = event.currentTarget;
    const panel = handle.parentElement;
    if (!panel) return;
    const doc = handle.ownerDocument;
    const ownerWindow = doc.defaultView;
    if (!ownerWindow) return;
    const view = ownerWindow;
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
    /** Releases drag listeners and pointer capture, optionally committing the width. */
    function stop(commit = true) {
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
    }
    /** Paints a bounded width and recovers if a pointer release event was missed. */
    function move(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) return;
      // Recover even when the browser/OS never delivered the release event.
      if ((moveEvent.buttons & 1) === 0) {
        stop();
        return;
      }
      nextWidth = clampWidth(startWidth + startX - moveEvent.clientX, maxWidth);
      if (frame === null) frame = view.requestAnimationFrame(paint);
    }
    /** Ends the resize only for the pointer that started it. */
    function end(endEvent: PointerEvent) {
      if (endEvent.pointerId === pointerId) stop();
    }
    /** Ends resizing when the browser window loses focus. */
    function blur() {
      stop();
    }
    /** Ends resizing when the document becomes hidden. */
    function visibilityChanged() {
      if (doc.visibilityState === 'hidden') stop();
    }
    /** Ends resizing on Escape without propagating the shortcut to the record. */
    function keyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key === 'Escape') {
        keyEvent.preventDefault();
        keyEvent.stopPropagation();
        stop();
      }
    }

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
  expanded: controlledExpanded,
  expandedMode = 'viewport',
  onExpandedChange,
  children,
}: RecordSidePanelRootProps) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;
  const [entering, setEntering] = useState(true);
  const panelRef = useRef<HTMLElement>(null);
  const previousExpanded = useRef(expanded);
  const showEntryMotion = entering && previousExpanded.current === expanded;

  useLayoutEffect(() => {
    const changed = previousExpanded.current !== expanded;
    previousExpanded.current = expanded;
    if (!changed) return undefined;
    setEntering(false);
    const panel = panelRef.current;
    if (
      !panel?.animate ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }
    // Animate the committed layout without fading or restarting entry motion.
    const animation = panel.animate(
      [
        {
          transform: `translateX(${expanded ? 20 : -12}px) scaleX(0.985)`,
          transformOrigin: 'top right',
        },
        { transform: 'none', transformOrigin: 'top right' },
      ],
      { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    return () => {
      animation?.cancel();
    };
  }, [expanded]);

  const toggle = useCallback(() => {
    setEntering(false);
    setInternalExpanded(!expanded);
    onExpandedChange?.(!expanded);
  }, [expanded, onExpandedChange]);
  const expansion = useMemo(() => ({ expanded, toggle }), [expanded, toggle]);
  const upperBound = Math.max(SIDE_PANEL_WIDTH.min, maxWidth);
  const panelWidth = clampWidth(width, upperBound);
  return (
    <PanelExpansionContext.Provider value={expansion}>
      <aside
        ref={panelRef}
        data-record-side-panel
        data-expanded={expanded || undefined}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) setEntering(false);
        }}
        style={{ width: expanded ? '100%' : panelWidth }}
        className={cn(
          '@container/record-panel relative flex flex-col flex-none max-w-full min-h-0 border-l bg-background transition-none',
          expanded &&
            (expandedMode === 'page'
              ? 'relative h-full min-w-0 flex-1 border-l-0'
              : 'fixed inset-0 z-40 h-svh border-l-0'),
          // Animate entry only: duration-200 must never ease drag width changes.
          showEntryMotion &&
            'animate-in fade-in-0 slide-in-from-right-8 duration-200 ease-out motion-reduce:animate-none',
          className,
        )}
      >
        {onWidthChange && !expanded && (
          <RecordSidePanelResizeHandle
            width={panelWidth}
            maxWidth={upperBound}
            onWidthChange={onWidthChange}
          />
        )}
        {children}
      </aside>
    </PanelExpansionContext.Provider>
  );
};

/** Renders record navigation, actions, and the guarded expansion shortcut. */
const RecordSidePanelHeader = ({
  className,
  avatar,
  title,
  actions,
  onBack,
  onExpand,
  onClose,
}: RecordSidePanelHeaderProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expansion = useContext(PanelExpansionContext);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const expand = onExpand ?? expansion?.toggle;
  const expanded = !onExpand && expansion?.expanded;
  const expandLabel = expanded
    ? t('collapse', 'Collapse record')
    : t('expand', 'Expand record');

  useEffect(() => {
    if (!expand) return undefined;
    /** Expands only the active panel when the shortcut is not owned by an editor or dialog. */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.key !== 'Enter' ||
        !event.shiftKey ||
        !(event.ctrlKey || event.metaKey) ||
        event.altKey
      )
        return;

      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="dialog"], [role="menu"], [role="listbox"]',
        )
      )
        return;

      const button = expandButtonRef.current;
      const panels = document.querySelectorAll('[data-record-side-panel]');
      if (
        !button ||
        button.closest('[data-record-side-panel]') !==
          panels[panels.length - 1] ||
        document.querySelector(
          '[role="dialog"][data-state="open"], [role="menu"][data-state="open"], [role="listbox"][data-state="open"]',
        )
      )
        return;

      event.preventDefault();
      expand();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expand]);

  return (
    // Same height and surface as the app's top bar, so the two read as one.
    <div
      className={cn(
        'flex items-center gap-1 h-12 px-2 border-b bg-sidebar flex-none',
        className,
      )}
    >
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
      {expand && (
        <Button
          ref={expandButtonRef}
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={expand}
          title={`${expandLabel} (Ctrl/⌘ + Shift + Enter)`}
          aria-label={expandLabel}
          aria-expanded={Boolean(expanded)}
          aria-keyshortcuts="Control+Shift+Enter Meta+Shift+Enter"
        >
          {expanded ? (
            <IconMinimize className="size-4" />
          ) : (
            <IconMaximize className="size-4" />
          )}
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

/** Keeps visited contact editors mounted and moves overflowing tabs into the More menu. */
const RecordSidePanelTabs = ({
  tabs,
  value,
  onValueChange,
  visibleCount = 3,
  overviewTab,
  expandedDefaultTab,
}: RecordSidePanelTabsProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expanded = useContext(PanelExpansionContext)?.expanded ?? false;
  const splitOverview = expanded && Boolean(overviewTab);
  const navigationTabs = splitOverview
    ? tabs.filter((tab) => tab.value !== overviewTab)
    : tabs;
  const selectedValue =
    splitOverview && value === overviewTab
      ? expandedDefaultTab || navigationTabs[0]?.value || value
      : value;
  const [visitedTabs, setVisitedTabs] = useState<string[]>([]);
  useLayoutEffect(() => {
    if (overviewTab) {
      setVisitedTabs((previous) =>
        previous.includes(selectedValue)
          ? previous
          : [...previous, selectedValue],
      );
    }
  }, [overviewTab, selectedValue]);
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

    if (!bar || (expanded && !splitOverview)) {
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

    const candidates = tabsRef.current
      .filter((tab) => !splitOverview || tab.value !== overviewTab)
      .slice(0, visibleCount);
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
      tabsRef.current.filter(
        (tab) => !splitOverview || tab.value !== overviewTab,
      ).length > visibleCount || total > available;
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
  }, [visibleCount, expanded, splitOverview, overviewTab]);

  useLayoutEffect(() => {
    const bar = barRef.current;

    measure();

    if (!bar || typeof ResizeObserver === 'undefined') {
      return undefined;
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

  const shownCount =
    expanded && !splitOverview
      ? navigationTabs.length
      : Math.min(visibleCount, fitCount);

  // Tabs shown for the first time are measured once drawn; their real width
  // then settles the count (each width is measured once, so it converges).
  useLayoutEffect(() => {
    measure();
  }, [shownCount, measure]);
  const activeIndex = navigationTabs.findIndex(
    (tab) => tab.value === selectedValue,
  );
  const visible =
    activeIndex >= shownCount
      ? [
          ...navigationTabs.slice(0, shownCount - 1),
          navigationTabs[activeIndex],
        ]
      : navigationTabs.slice(0, shownCount);
  const overflow = navigationTabs.filter((tab) => !visible.includes(tab));

  let contentLayout = 'flex flex-col';
  let navigationLayout =
    'box-content items-center gap-1 h-10 px-2 border-b bg-background';
  if (splitOverview) {
    contentLayout =
      'grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] md:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)]';
    navigationLayout =
      'col-start-1 row-start-2 box-content h-10 items-center gap-1 border-b bg-background px-3 md:col-start-2 md:row-start-1';
  } else if (expanded) {
    contentLayout = 'flex flex-row';
    navigationLayout =
      'w-14 flex-col overflow-y-auto border-r bg-sidebar p-2 sm:w-48 sm:p-3';
  }

  return (
    <Tabs
      value={selectedValue}
      onValueChange={onValueChange}
      orientation={expanded && !splitOverview ? 'vertical' : 'horizontal'}
      className={cn('flex-1 min-h-0 min-w-0', contentLayout)}
    >
      {/* Lines up with a page's breadcrumb row: h-10 plus its 1px rule. */}
      {/* Never wider than its container: pinning a tab moves tabs into More
          instead of widening whatever holds the panel. */}
      <div
        ref={barRef}
        className={cn(
          'flex flex-none min-w-0 overflow-hidden',
          navigationLayout,
        )}
      >
        <Tabs.List
          aria-label={t('navigation', 'Record navigation')}
          className={cn(
            'flex min-w-0 items-stretch border-b-0 gap-1 py-0',
            expanded && !splitOverview ? 'flex-col' : 'h-full',
          )}
        >
          {visible.map((tab) => (
            // Full row height, so the active underline lands on the row's
            // bottom border instead of above it.
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              data-panel-tab={tab.value}
              title={expanded ? tab.label : undefined}
              className={cn(
                'text-xs motion-reduce:transition-none',
                expanded && !splitOverview
                  ? 'h-9 justify-start gap-2.5 rounded-md px-2.5 after:hidden data-[state=active]:bg-primary/10 data-[state=active]:hover:bg-primary/10'
                  : 'h-full gap-1.5 rounded-none after:-mb-px',
              )}
            >
              <tab.icon className="size-4 shrink-0" aria-hidden="true" />
              <span
                className={
                  expanded && !splitOverview
                    ? 'sr-only sm:not-sr-only'
                    : undefined
                }
              >
                {tab.label}
              </span>
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
          forceMount={
            tab.value === overviewTab ||
            (Boolean(overviewTab) && visitedTabs.includes(tab.value)) ||
            undefined
          }
          // A widget's own header lines up with a page's filter row (37px).
          // A quick fade when switching tabs or opening another record.
          className={cn(
            'flex-1 min-h-0 min-w-0 flex-col [&_[data-side-menu-header]]:h-9 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-150 motion-reduce:animate-none',
            splitOverview && tab.value === overviewTab
              ? 'col-start-1 row-start-1 flex border-b bg-background md:row-span-2 md:border-b-0 md:border-r'
              : 'data-[state=active]:flex data-[state=inactive]:hidden',
            splitOverview &&
              tab.value !== overviewTab &&
              'col-start-1 row-start-3 md:col-start-2 md:row-start-2',
          )}
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
