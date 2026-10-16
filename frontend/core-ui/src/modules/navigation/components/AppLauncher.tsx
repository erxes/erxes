import { OrgLogoIcon } from '@/auth/components/Logo';
import { isHomePath } from '@/home/utils/isHomePath';
import { AppLogo } from '@/navigation/components/AppLogo';
import { useAppPlaces } from '@/navigation/hooks/useAppPlaces';
import { useCurrentApp } from '@/navigation/hooks/useCurrentApp';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { useRecentPages } from '@/navigation/hooks/useRecentPages';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { AppPath } from '@/types/paths/AppPath';
import { WORKSPACE_SETTINGS_PATH } from '@/settings/constants/workspaceSettingsPath';
import { IconCheck, IconSettings } from '@tabler/icons-react';
import { Command, Kbd, Popover } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation, useNavigate } from 'react-router-dom';

const RECENT_APPS_LIMIT = 3;

const groupHeading =
  '**:[[cmdk-group-heading]]:font-mono **:[[cmdk-group-heading]]:uppercase';

/** Searchable list of every app, opened by the `children` trigger. */
export const AppLauncher = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const activities = useNavigationActivities();
  const current = useCurrentApp();
  const { placeOf } = useAppPlaces();
  const isHome = isHomePath(useLocation().pathname);
  const recentApps = [
    ...new Set(useRecentPages().map(({ activity }) => activity)),
  ]
    .filter((app) => app.id !== current?.id)
    .slice(0, RECENT_APPS_LIMIT);

  useHotkeys('mod+j', () => setOpen((value) => !value), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) setSearch('');
  };

  const go = (to: string) => {
    handleOpenChange(false);
    navigate(to);
  };

  const renderGroup = (
    heading: string,
    apps: INavigationActivity[],
    valuePrefix = '',
  ) =>
    apps.length > 0 && (
      <Command.Group heading={heading} className={groupHeading}>
        {apps.map((app) => {
          const place = placeOf(app);

          return (
            <Command.Item
              key={app.id}
              value={`${valuePrefix}${app.label} ${app.description ?? ''}`}
              onSelect={() => go(place.to)}
              className="h-auto gap-3 rounded-md px-2 py-1.5"
            >
              <span className="shrink-0">
                <AppLogo activity={app} size={28} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {app.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {place.label ? `Resume · ${place.label}` : app.description}
                </span>
              </span>
              {current?.id === app.id && (
                <IconCheck
                  className="text-primary"
                  aria-label="Current plugin"
                />
              )}
            </Command.Item>
          );
        })}
      </Command.Group>
    );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Content
        align="start"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-1rem))] overflow-hidden p-0"
      >
        <Command loop>
          <div className="flex items-center gap-2 border-b pr-3">
            <Command.Input
              variant="primary"
              placeholder="Find a plugin"
              wrapperClassName="flex-1 border-b-0 h-11"
              value={search}
              onValueChange={setSearch}
              focusOnMount
            />
            <Kbd>⌘J</Kbd>
          </div>
          <Command.List className="m-0 max-h-[min(32rem,70vh)] p-1">
            <Command.Empty>No plugin matches that name.</Command.Empty>
            <Command.Group>
              <Command.Item
                value="home for you recent starred"
                onSelect={() => go(`/${AppPath.Home}`)}
                className="h-auto gap-3 rounded-md px-2 py-1.5"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-[23%] border bg-background [&>img]:size-4! [&>svg]:size-4!">
                  <OrgLogoIcon className="text-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    Home
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    For you, recent and starred
                  </span>
                </span>
                {isHome && (
                  <IconCheck className="text-primary" aria-label="Current" />
                )}
              </Command.Item>
            </Command.Group>
            {!search && renderGroup('Recent', recentApps, 'recent ')}
            {renderGroup(
              'Plugins',
              activities.filter((activity) => activity.kind === 'plugin'),
            )}
            {renderGroup(
              'Shared',
              activities.filter((activity) => activity.kind === 'core'),
            )}
            <Command.Separator className="my-1" />
            <Command.Group>
              <Command.Item
                value="workspace settings"
                onSelect={() => go(WORKSPACE_SETTINGS_PATH)}
                className="gap-2 rounded-md"
              >
                <IconSettings />
                Workspace settings
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
