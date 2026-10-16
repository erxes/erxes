import { useAuth } from '@/auth/hooks/useAuth';
import { SelectLanguages } from '@/navigation/components/footer/SelectLanguages';
import { ThemeSelector } from '@/navigation/components/footer/ThemeSelector';
import { User } from '@/navigation/components/footer/User';
import {
  visitedPageTabsState,
  visitedPageTabsVisibleState,
} from '@/navigation/states/visitedPageTabsState';
import { AppPath } from '@/types/paths/AppPath';
import { SettingsPath } from '@/types/paths/SettingsPath';
import { IconChevronRight, IconLayoutNavbarExpand } from '@tabler/icons-react';
import { Avatar, Button, DropdownMenu, readImage } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { currentUserState } from 'ui-modules';

export const NavigationUserMenu = () => {
  const currentUser = useAtomValue(currentUserState);
  const { handleLogout } = useAuth();
  const { t: organizationT } = useTranslation('organization');
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });
  const userDetails = currentUser?.details;
  const userName = userDetails?.fullName || sidebarT('profile');
  const tabs = useAtomValue(visitedPageTabsState);
  const [tabsVisible, setTabsVisible] = useAtom(visitedPageTabsVisibleState);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-label={sidebarT('profile')}
          className="size-8 rounded-full p-0"
          variant="ghost"
        >
          <Avatar className="size-7">
            <Avatar.Image
              src={readImage(userDetails?.avatar || '')}
              alt={userName}
            />
            <Avatar.Fallback className="text-xs">
              {userName.charAt(0)}
            </Avatar.Fallback>
          </Avatar>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        className="w-56 min-w-56! space-y-1 p-1.5"
        sideOffset={8}
      >
        <DropdownMenu.Item asChild className="p-2">
          <Link to={`/${AppPath.Settings}/${SettingsPath.Profile}`}>
            <User />
            <IconChevronRight className="text-muted-foreground" />
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="h-7 py-0 text-sm"
          onClick={() => setTabsVisible(!tabsVisible)}
        >
          <IconLayoutNavbarExpand />
          {tabsVisible ? 'Hide page tabs' : `Show page tabs (${tabs.length})`}
        </DropdownMenu.Item>
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
