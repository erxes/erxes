import { IconGridDots } from '@tabler/icons-react';
import { Button, cn, Popover } from 'erxes-ui';
import { useState } from 'react';
import type { NavApp } from './apps';
import { coreTabIconClassName } from './coreTabClassName';
import { CoreTabTooltip } from './CoreTabTooltip';

const AppGroup = ({
  label,
  apps,
  activeId,
  onSelect,
}: {
  label: string;
  apps: NavApp[];
  activeId?: string;
  onSelect: (app: NavApp) => void;
}) =>
  apps.length ? (
    <section className="py-1 first:pt-0">
      <h2 className="flex h-7 items-center px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h2>
      <div className="grid grid-cols-2 gap-0.5">
        {apps.map((app) => {
          const Icon = app.icon;
          const active = app.id === activeId;

          return (
            <Button
              key={app.id}
              type="button"
              variant="ghost"
              aria-current={active ? 'page' : undefined}
              className={cn(
                'h-8 min-w-0 justify-start gap-2 px-2 text-sm font-medium',
                active &&
                  'bg-primary/10 text-primary-text hover:bg-primary/15 hover:text-primary-text',
              )}
              onClick={() => onSelect(app)}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{app.label}</span>
            </Button>
          );
        })}
      </div>
    </section>
  ) : null;

/** The grid button: every app and plugin, grouped. */
export const CoreTabAppSwitcher = ({
  apps,
  activeId,
  onSelect,
}: {
  apps: NavApp[];
  activeId?: string;
  onSelect: (app: NavApp) => void;
}) => {
  const [open, setOpen] = useState(false);

  const select = (app: NavApp) => {
    setOpen(false);
    onSelect(app);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <CoreTabTooltip label="Open app">
        <Popover.Trigger
          render={
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Open app"
              className={coreTabIconClassName(open)}
            />
          }
        >
          <IconGridDots className="size-4" />
        </Popover.Trigger>
      </CoreTabTooltip>
      <Popover.Content
        align="start"
        side="bottom"
        sideOffset={8}
        variant="compact"
        className="w-80"
      >
        <AppGroup
          label="Plugins"
          apps={apps.filter((app) => app.kind === 'plugin')}
          activeId={activeId}
          onSelect={select}
        />
        <AppGroup
          label="Core modules"
          apps={apps.filter((app) => app.kind === 'core')}
          activeId={activeId}
          onSelect={select}
        />
      </Popover.Content>
    </Popover>
  );
};
