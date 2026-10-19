import {
  Icon,
  IconChevronDown,
  IconMaximize,
  IconX,
} from '@tabler/icons-react';
import { Button, cn, DropdownMenu, Tabs } from 'erxes-ui';
import { useEffect, useRef } from 'react';
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
  const stopResize = useRef<(() => void) | null>(null);
  useEffect(() => () => stopResize.current?.(), []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    stopResize.current?.();
    const startX = event.clientX;
    const startWidth =
      event.currentTarget.parentElement?.getBoundingClientRect().width || width;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    const handlePointerMove = (moveEvent: PointerEvent) =>
      onWidthChange(
        clampWidth(startWidth + startX - moveEvent.clientX, maxWidth),
      );

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', handlePointerUp);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      stopResize.current = null;
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('blur', handlePointerUp);
    stopResize.current = handlePointerUp;
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={t('resize', 'Resize side panel')}
      aria-valuemin={SIDE_PANEL_WIDTH.min}
      aria-valuemax={maxWidth}
      aria-valuenow={width}
      tabIndex={0}
      title={t('drag-to-resize', 'Drag to resize')}
      className="group absolute inset-y-0 -left-1.5 z-10 flex w-3 cursor-col-resize touch-none items-center justify-center hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none active:bg-primary/20"
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
      <span className="h-8 w-1 rounded-full bg-border transition-colors group-hover:bg-primary/60 group-focus-visible:bg-primary/60 group-active:bg-primary" />
    </div>
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
        'relative flex flex-col flex-none max-w-full min-h-0 border-l bg-background',
        // Eases in from the right instead of popping open.
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
  onExpand,
  onClose,
}: {
  avatar?: React.ReactNode;
  title: React.ReactNode;
  onExpand?: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    // Same height and surface as the app's top bar, so the two read as one.
    <div className="flex items-center gap-1 h-12 px-2 border-b bg-sidebar flex-none">
      {avatar}
      <div className="flex-1 min-w-0 px-1 text-sm font-medium truncate">
        {title}
      </div>
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

  const activeIndex = tabs.findIndex((tab) => tab.value === value);
  const visible =
    activeIndex >= visibleCount
      ? [...tabs.slice(0, visibleCount - 1), tabs[activeIndex]]
      : tabs.slice(0, visibleCount);
  const overflow = tabs.filter((tab) => !visible.includes(tab));

  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className="flex flex-col flex-1 min-h-0"
    >
      {/* Lines up with a page's breadcrumb row: h-10 plus its 1px rule. */}
      <div className="box-content flex items-center gap-1 h-10 px-2 border-b bg-background flex-none">
        <Tabs.List className="flex h-full items-stretch border-b-0 gap-1 py-0">
          {visible.map((tab) => (
            // Full row height, so the active underline lands on the row's
            // bottom border instead of above it.
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
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
