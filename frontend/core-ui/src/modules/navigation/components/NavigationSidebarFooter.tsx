import { useAuth } from '@/auth/hooks/useAuth';
import { SelectLanguages } from '@/navigation/components/SelectLanguages';
import { ThemeSelector } from '@/navigation/components/ThemeSelector';
import { User } from '@/navigation/components/User';
import { AppPath } from '@/types/paths/AppPath';
import { SettingsPath } from '@/types/paths/SettingsPath';
import {
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconUserCircle,
} from '@tabler/icons-react';
import { Avatar, Button, cn, DropdownMenu, readImage } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { currentUserState } from 'ui-modules';

export const NavigationSidebarFooter = ({
  expanded,
  isSettings,
}: {
  expanded: boolean;
  isSettings: boolean;
}) => {
  const currentUser = useAtomValue(currentUserState);
  const { handleLogout } = useAuth();
  const { t: organizationT } = useTranslation('organization');
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });
  const userDetails = currentUser?.details;
  const userName = userDetails?.fullName || sidebarT('profile');

  return (
    <div
      className={cn(
        'flex flex-col gap-1 pb-2',
        expanded ? 'items-stretch' : 'items-center',
      )}
    >
      <Button
        asChild
        className={cn(
          'rounded-md [&>svg]:size-4!',
          expanded
            ? 'h-7 w-full justify-start gap-2 px-2 text-sm'
            : 'size-7 justify-center px-0',
          isSettings && 'bg-primary/10',
        )}
        size={expanded ? 'default' : 'icon'}
        variant="ghost"
      >
        <Link
          aria-label={organizationT('settings')}
          to={`/${AppPath.Settings}`}
        >
          <IconSettings
            className={cn(
              'size-4 text-accent-foreground',
              isSettings && 'text-primary',
            )}
          />
          {expanded && (
            <span className="truncate font-medium">
              {organizationT('settings')}
            </span>
          )}
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            aria-label={sidebarT('profile')}
            className={cn(
              'rounded-md',
              expanded
                ? 'h-10 w-full justify-start gap-2 px-2 text-sm'
                : 'size-7 justify-center px-0',
            )}
            size={expanded ? 'default' : 'icon'}
            variant="ghost"
          >
            <Avatar className="size-6">
              <Avatar.Image
                src={readImage(userDetails?.avatar || '')}
                alt={userName}
              />
              <Avatar.Fallback className="text-[10px]">
                {userName.charAt(0)}
              </Avatar.Fallback>
            </Avatar>
            {expanded && (
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {currentUser?.email}
                </span>
              </span>
            )}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align={expanded ? 'start' : 'end'}
          alignOffset={expanded ? -8 : 0}
          className="w-52 min-w-52! space-y-0.5 p-1.5"
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
          <DropdownMenu.Item asChild className="h-9 text-sm">
            <Link to={`/${AppPath.Settings}/${SettingsPath.Profile}`}>
              <IconUserCircle />
              {sidebarT('profile')}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className="h-9 text-sm">
            <Link to={`/${AppPath.Settings}`}>
              <IconSettings />
              {organizationT('settings')}
            </Link>
          </DropdownMenu.Item>
          <ThemeSelector />
          <SelectLanguages />
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            className="h-9 text-sm"
            onClick={() => handleLogout()}
          >
            <IconLogout />
            {organizationT('logout')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};
