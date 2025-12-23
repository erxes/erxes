import { currentOrganizationState } from 'ui-modules';

import { cn, DropdownMenu, Sidebar, TextOverflowTooltip } from 'erxes-ui';

import { useAtom } from 'jotai';
import { IconSelector } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { User } from '@/navigation/components/User';
import { ThemeSelector } from '@/navigation/components/ThemeSelector';
import { SelectLanguages } from '@/navigation/components/SelectLanguages';
import { useTranslation } from 'react-i18next';
import { OrgLogoIcon } from '@/auth/components/Logo';

export function Organization() {
  const [currentOrganization] = useAtom(currentOrganizationState);
  const { handleLogout } = useAuth();
  const { t } = useTranslation('organization');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Sidebar.MenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-auto p-2"
        >
          <div className="flex size-8 rounded-lg  items-center justify-center overflow-hidden flex-none shadow-xs">
            <OrgLogoIcon className="size-7 text-primary flex-none" />
          </div>
          <TextOverflowTooltip
            value={
              currentOrganization?.name
                ? currentOrganization.name
                : currentOrganization?.orgShortName || 'erxes'
            }
            className={cn('font-medium text-sm', {
              'text-accent-foreground font-normal':
                !currentOrganization?.name &&
                !currentOrganization?.orgShortName,
            })}
          />
          <IconSelector className="ml-auto size-4 text-accent-foreground" />
        </Sidebar.MenuButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="space-y-1">
        <User />
        <DropdownMenu.Separator />
        <DropdownMenu.Item asChild>
          <Link to="/settings" className="text-sm">
            {t('settings')}
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <ThemeSelector />
        <SelectLanguages />
        <DropdownMenu.Separator />
        <DropdownMenu.Item className="text-sm" onClick={() => handleLogout()}>
          {t('logout')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Label className="flex items-center gap-2">
          {t('version')}
          <span className="text-primary ml-auto tracking-wider">
            3.0.0-beta.1
          </span>
        </DropdownMenu.Label>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

{
  /* <DropdownMenu.Item asChild>
          <Link to="/settings/team-member" className="text-sm">
            Invite and manage team members
          </Link>
        </DropdownMenu.Item> */
}

{
  /* <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            Switch organization
            <IconChevronRight className="ml-auto size-4 text-accent-foreground" />
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent className="min-w-[300px]">
            <DropdownMenu.RadioGroup value="1">
              <DropdownMenu.RadioItem value="1">
                <Avatar
                  size="lg"
                  className="rounded outline-1 outline-solid outline-black/10 -outline-offset-1"
                >
                  <Avatar.Image src="https://github.com/shadcn.png" />
                  <Avatar.Fallback className="rounded-none">CN</Avatar.Fallback>
                </Avatar>
                Organization 1
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="2">
                <Avatar
                  size="lg"
                  className="rounded outline-1 outline-solid outline-black/10 -outline-offset-1"
                >
                  <Avatar.Image src="https://github.com/khbaterdene.png" />
                  <Avatar.Fallback className="rounded-none">CN</Avatar.Fallback>
                </Avatar>
                Organization 2
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="3">
                <Avatar
                  size="lg"
                  className="rounded outline-1 outline-solid outline-black/10 -outline-offset-1"
                >
                  <Avatar.Image src="https://github.com/Enkhtuvshin0513.png" />
                  <Avatar.Fallback className="rounded-none">CN</Avatar.Fallback>
                </Avatar>
                Organization 3
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub> */
}
