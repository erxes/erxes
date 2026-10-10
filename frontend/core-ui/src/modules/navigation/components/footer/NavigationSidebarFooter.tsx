import { Avatar, Button, DropdownMenu, Sidebar, cn, readImage } from 'erxes-ui';
import {
  IconChevronRight,
  IconSelector,
  IconSettings,
} from '@tabler/icons-react';

import { AppPath } from '@/types/paths/AppPath';
import { Link } from 'react-router-dom';
import { NavigationRailLabel } from '@/navigation/components/navigation-activity-rail/NavigationRailLabel';
import { SelectLanguages } from '@/navigation/components/footer/SelectLanguages';
import { SettingsPath } from '@/types/paths/SettingsPath';
import { ThemeSelector } from '@/navigation/components/footer/ThemeSelector';
import { User } from '@/navigation/components/footer/User';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useAuth } from '@/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export const NavigationSidebarFooter = ({
  expanded,
  isSettings,
}: {
  expanded: boolean;
  isSettings: boolean;
}) => {
  const currentUser = useAtomValue(currentUserState);
  const { setOpen } = Sidebar.useSidebar();
  const { handleLogout } = useAuth();
  const { t: organizationT } = useTranslation('organization');
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });
  const userDetails = currentUser?.details;
  const userName = userDetails?.fullName || sidebarT('profile');
  const collapsedInSettings = isSettings && !expanded;

  return (
    <div className="sticky bottom-0 mt-1 flex shrink-0 flex-col items-stretch gap-1 bg-sidebar pt-2">
      <Button
        asChild
        className={cn(
          'h-7 shrink-0 justify-start gap-2 rounded text-sm transition-[width,margin,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [&>svg]:size-4!',
          expanded ? 'w-full px-2' : 'ml-0.5 w-7 px-1.5',
          collapsedInSettings && 'bg-foreground/5',
        )}
        size="default"
        variant="ghost"
      >
        <Link
          data-nav-row
          aria-label={organizationT('settings')}
          to={`/${AppPath.Settings}`}
          onClick={(event) => {
            if (collapsedInSettings) {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          <IconSettings
            className={cn('size-4', collapsedInSettings && 'text-foreground')}
          />
          <NavigationRailLabel
            className="truncate font-medium"
            expanded={expanded}
          >
            {organizationT('settings')}
          </NavigationRailLabel>
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            aria-label={sidebarT('profile')}
            className={cn(
              'h-12 shrink-0 justify-start gap-2 rounded text-sm transition-[width,margin,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              expanded ? 'w-full px-2' : 'ml-0.5 w-8 gap-0 px-0',
            )}
            size="default"
            variant="ghost"
          >
            <Avatar className="size-8 shrink-0 rounded-lg">
              <Avatar.Image
                src={readImage(userDetails?.avatar || '')}
                alt={userName}
              />
              <Avatar.Fallback className="rounded-lg text-xs">
                {userName.charAt(0)}
              </Avatar.Fallback>
            </Avatar>
            <NavigationRailLabel
              className="grid flex-1 text-left leading-tight"
              expanded={expanded}
            >
              <span className="truncate font-medium">{userName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {currentUser?.email}
              </span>
            </NavigationRailLabel>
            {expanded && (
              <IconSelector className="ml-auto size-4 shrink-0 text-muted-foreground" />
            )}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align={expanded ? 'start' : 'end'}
          className={cn(
            'space-y-1 p-1.5',
            expanded
              ? 'w-(--radix-dropdown-menu-trigger-width) min-w-56!'
              : 'w-48 min-w-48!',
          )}
          side={expanded ? 'top' : 'right'}
          sideOffset={8}
        >
          <DropdownMenu.Item asChild className="p-2">
            <Link to={`/${AppPath.Settings}/${SettingsPath.Profile}`}>
              <User />
              <IconChevronRight className="text-muted-foreground" />
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <ThemeSelector />
          <SelectLanguages />
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            className="h-7 py-0 text-sm"
            onClick={() => handleLogout()}
          >
            {organizationT('logout')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};
