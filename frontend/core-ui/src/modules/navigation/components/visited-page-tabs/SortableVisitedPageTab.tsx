import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { IconLayoutNavbarCollapse, IconX } from '@tabler/icons-react';
import { Button, cn, ContextMenu, Tabs } from 'erxes-ui';
import type { ElementType } from 'react';
import { useCallback, useEffect, useRef } from 'react';

export const SortableVisitedPageTab = ({
  closeAriaShortcut,
  closeLabel,
  closeAllLabel,
  closeShortcutLabel,
  hideTabsLabel,
  icon: Icon,
  isActive,
  label,
  onClose,
  onCloseAll,
  onHideTabs,
  tabId,
}: Readonly<{
  closeAriaShortcut: string;
  closeLabel: string;
  closeAllLabel: string;
  closeShortcutLabel: string;
  hideTabsLabel: string;
  icon: ElementType;
  isActive: boolean;
  label: string;
  onClose: () => void;
  onCloseAll: () => void;
  onHideTabs: () => void;
  tabId: string;
}>) => {
  const tabRef = useRef<HTMLDivElement | null>(null);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: tabId });
  const setTabRef = useCallback(
    (node: HTMLDivElement | null) => {
      tabRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useEffect(() => {
    if (!isActive) {
      return;
    }

    tabRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  }, [isActive]);

  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <div
          ref={setTabRef}
          className={cn(
            'group/tab flex h-6 min-w-20 max-w-40 shrink-0 items-center rounded-md border border-transparent text-accent-foreground transition-[background-color,border-color,box-shadow,color,opacity] hover:bg-accent/70 hover:text-foreground data-[active=true]:border-border data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm',
            isDragging && 'z-10 opacity-40',
          )}
          data-active={isActive}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
          }}
          {...attributes}
          {...listeners}
        >
          <Tabs.Trigger
            value={tabId}
            title={label}
            className="h-full min-w-0 flex-1 justify-start gap-1 rounded-md bg-transparent px-1.5 text-[11px] font-medium text-inherit shadow-none hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-inherit data-[state=active]:shadow-none data-[state=active]:hover:bg-transparent"
          >
            <Icon
              className={cn(
                'size-3 shrink-0 text-muted-foreground',
                isActive && 'text-primary',
              )}
            />
            <span className="truncate">{label}</span>
          </Tabs.Trigger>
          <Button
            aria-label={closeLabel}
            aria-keyshortcuts={isActive ? closeAriaShortcut : undefined}
            className="mr-0.5 size-4 shrink-0 rounded opacity-0 transition-[background-color,opacity] hover:bg-accent group-hover/tab:opacity-100 group-focus-within/tab:opacity-100 data-[active=true]:opacity-100"
            data-active={isActive}
            onClick={onClose}
            onPointerDown={(event) => event.stopPropagation()}
            size="icon"
            title={
              isActive ? `${closeLabel} (${closeShortcutLabel})` : closeLabel
            }
            type="button"
            variant="ghost"
          >
            <IconX className="size-2.5" />
          </Button>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={onCloseAll}>
          <IconX />
          {closeAllLabel}
        </ContextMenu.Item>
        <ContextMenu.Item onSelect={onHideTabs}>
          <IconLayoutNavbarCollapse />
          {hideTabsLabel}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
};
