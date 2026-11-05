import { Avatar, Button, DropdownMenu, readImage } from 'erxes-ui';

import { AppPath } from '@/types/paths/AppPath';
import { CoreTabTooltip } from '@/navigation/components/core-tab/CoreTabTooltip';
import { IconChevronRight, IconSettings } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { SelectLanguages } from '@/navigation/components/footer/SelectLanguages';
import { SettingsPath } from '@/types/paths/SettingsPath';
import { ThemeSelector } from '@/navigation/components/footer/ThemeSelector';
import { User } from '@/navigation/components/footer/User';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useAuth } from '@/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export const CoreTabUserMenu = () => {
  const currentUser = useAtomValue(currentUserState);
  const { handleLogout } = useAuth();
  const { t: organizationT } = useTranslation('organization');
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { t: navigationT } = useTranslation('common', {
    keyPrefix: 'navigation',
  });
  const userDetails = currentUser?.details;
  const userName = userDetails?.fullName || sidebarT('profile');

  return (
    <DropdownMenu>
      <CoreTabTooltip label={userName}>
        <DropdownMenu.Trigger asChild>
          <Button
            aria-label={sidebarT('profile')}
            className="size-7 shrink-0 p-0"
            size="icon"
            variant="ghost"
          >
            <Avatar className="size-6 rounded-md">
              <Avatar.Image
                src={readImage(userDetails?.avatar || '')}
                alt={userName}
              />
              <Avatar.Fallback className="rounded-md text-xs">
                {userName.charAt(0)}
              </Avatar.Fallback>
            </Avatar>
          </Button>
        </DropdownMenu.Trigger>
      </CoreTabTooltip>
      <DropdownMenu.Content
        align="end"
        className="w-56 min-w-56! space-y-1 p-1.5"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenu.Item asChild className="p-2">
          <Link to={`/${AppPath.Settings}/${SettingsPath.Profile}`}>
            <User />
            <IconChevronRight className="text-muted-foreground" />
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild className="h-7 py-0 text-sm">
          <Link to={`/${AppPath.Settings}`}>
            <IconSettings className="text-muted-foreground" />
            {navigationT('app-settings', 'Settings')}
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
  );
};
