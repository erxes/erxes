import { useAuth } from '@/auth/hooks/useAuth';
import { SelectLanguages } from '@/navigation/components/SelectLanguages';
import { ThemeSelector } from '@/navigation/components/ThemeSelector';
import { User } from '@/navigation/components/User';
import { AppPath } from '@/types/paths/AppPath';
import { IconSettings } from '@tabler/icons-react';
import { Avatar, Button, cn, DropdownMenu, readImage, Sidebar } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { currentUserState } from 'ui-modules';

export const NavigationSidebarFooter = ({
  isSettings,
}: {
  isSettings: boolean;
}) => {
  const currentUser = useAtomValue(currentUserState);
  const { setOpen } = Sidebar.useSidebar();
  const { handleLogout } = useAuth();
  const { t: organizationT } = useTranslation('organization');
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });
  const userDetails = currentUser?.details;
  const userName = userDetails?.fullName || sidebarT('profile');

  return (
    <div className="flex flex-col items-center gap-1 px-1 pb-2">
      <Button
        asChild
        className={cn('h-9 w-10 rounded-md', isSettings && 'bg-primary/10')}
        size="icon"
        title={organizationT('settings')}
        variant="ghost"
      >
        <Link
          aria-label={organizationT('settings')}
          to={`/${AppPath.Settings}`}
          onClick={() => setOpen(true)}
        >
          <IconSettings
            className={cn(
              'size-[18px] text-accent-foreground',
              isSettings && 'text-primary',
            )}
          />
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            aria-label={sidebarT('profile')}
            className="size-9 rounded-md"
            size="icon"
            title={userName}
            variant="ghost"
          >
            <Avatar className="size-7">
              <Avatar.Image
                src={readImage(userDetails?.avatar || '')}
                alt={userName}
              />
              <Avatar.Fallback className="text-[10px]">
                {userName.charAt(0)}
              </Avatar.Fallback>
            </Avatar>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="space-y-1" side="right">
          <User />
          <DropdownMenu.Separator />
          <ThemeSelector />
          <SelectLanguages />
          <DropdownMenu.Separator />
          <DropdownMenu.Item className="text-sm" onClick={() => handleLogout()}>
            {organizationT('logout')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};
