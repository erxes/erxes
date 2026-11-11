import { IconX } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import type { NavApp } from './apps';

/** Open apps as tabs; the active one is highlighted, each can be closed. */
export const CoreTabAppTabs = ({
  tabs,
  activeId,
  onSelect,
  onClose,
}: {
  tabs: NavApp[];
  activeId?: string;
  onSelect: (app: NavApp) => void;
  onClose: (id: string) => void;
}) => (
  <nav aria-label="Open apps" className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto styled-scroll">
    {tabs.map((app) => {
      const Icon = app.icon;
      const active = app.id === activeId;

      return (
        <div
          key={app.id}
          className={cn(
            'group/tab flex h-7 shrink-0 items-center rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground',
            active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
          )}
        >
          <button
            type="button"
            aria-current={active ? 'page' : undefined}
            className="flex h-full max-w-48 items-center gap-1.5 pl-2 pr-1 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            onClick={() => onSelect(app)}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{app.label}</span>
          </button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`Close ${app.label}`}
            className={cn(
              'mr-0.5 size-5 shrink-0 opacity-0 group-hover/tab:opacity-100 focus-visible:opacity-100',
              active && 'opacity-60',
            )}
            onClick={() => onClose(app.id)}
          >
            <IconX className="size-3" />
          </Button>
        </div>
      );
    })}
  </nav>
);
