import { currentOrganizationState } from 'ui-modules';

import {
  activePluginState,
  Button,
  cn,
  DropdownMenu,
  TextOverflowTooltip,
} from 'erxes-ui';

import { useAtom, useSetAtom } from 'jotai';
import { IconDotsVertical } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { User } from '@/navigation/components/User';
import { ThemeSelector } from '@/navigation/components/ThemeSelector';
import { SelectLanguages } from '@/navigation/components/SelectLanguages';
import { useTranslation } from 'react-i18next';
import { OrgLogoIcon } from '@/auth/components/Logo';
import { AppPath } from '@/types/paths/AppPath';
import { useAppVersion } from '@/navigation/hooks/useAppVersion';

export function Organization() {
  const [currentOrganization] = useAtom(currentOrganizationState);
  const setActivePlugin = useSetAtom(activePluginState);
  const { handleLogout } = useAuth();
  const { t } = useTranslation('organization');
  const version = useAppVersion();

  const hasOrgName =
    !!currentOrganization?.name || !!currentOrganization?.orgShortName;

  return (
    <div className="flex w-full items-stretch gap-1">
      <Link
        to={AppPath.Index}
        aria-label={t('home')}
        onClick={() => setActivePlugin('')}
        className="flex flex-4 min-w-0 items-center gap-2 rounded p-1 transition-colors hover:bg-accent-foreground/10"
      >
        <div className="flex size-8 rounded-lg items-center justify-center overflow-hidden flex-none shadow-xs">
          <OrgLogoIcon className="size-7 text-primary flex-none" />
        </div>
        <TextOverflowTooltip
          value={
            currentOrganization?.name
              ? currentOrganization.name
              : currentOrganization?.orgShortName || 'erxes'
          }
          className={cn('font-medium text-sm', {
            'text-accent-foreground font-normal': !hasOrgName,
          })}
        />
      </Link>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            type="button"
            className="flex flex-1 h-auto items-center justify-center gap-2 rounded p-1 font-medium text-sm text-foreground transition-colors hover:bg-accent-foreground/10 outline-none focus-visible:outline-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <IconDotsVertical className="text-foreground" stroke={2} />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="space-y-1 ml-2">
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
              {version}
            </span>
          </DropdownMenu.Label>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
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
