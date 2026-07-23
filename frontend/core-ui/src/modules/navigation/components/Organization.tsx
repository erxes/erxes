import { OrgLogoIcon } from '@/auth/components/Logo';
import { useAuth } from '@/auth/hooks/useAuth';
import { useAppVersion } from '@/navigation/hooks/useAppVersion';
import { AppPath } from '@/types/paths/AppPath';
import { IconDotsVertical } from '@tabler/icons-react';
import {
  activePluginState,
  Avatar,
  Button,
  cn,
  DropdownMenu,
  readImage,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { currentOrganizationState, currentUserState } from 'ui-modules';
import { SelectLanguages } from '@/navigation/components/SelectLanguages';
import { ThemeSelector } from '@/navigation/components/ThemeSelector';
import { User } from '@/navigation/components/User';

interface OrganizationProps {
  compact?: boolean;
}

interface OrganizationMenuContentProps {
  onLogout: () => void;
  version: string;
}

const OrganizationMenuContent = ({
  onLogout,
  version,
}: OrganizationMenuContentProps) => {
  const { t } = useTranslation('organization');

  return (
    <>
      <User />
      <DropdownMenu.Separator />
      <DropdownMenu.Item asChild>
        <Link to={`/${AppPath.Settings}`} className="text-sm">
          {t('settings')}
        </Link>
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <ThemeSelector />
      <SelectLanguages />
      <DropdownMenu.Separator />
      <DropdownMenu.Item className="text-sm" onClick={onLogout}>
        {t('logout')}
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Label className="flex items-center gap-2">
        {t('version')}
        <span className="ml-auto tracking-wider text-primary">{version}</span>
      </DropdownMenu.Label>
    </>
  );
};

const CompactOrganizationMenu = ({
  onLogout,
  version,
}: OrganizationMenuContentProps) => {
  const currentUser = useAtomValue(currentUserState);
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const fullName = currentUser?.details?.fullName || '';

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-label={t('profile')}
          className="mt-1 size-8 rounded-full p-0"
          size="icon"
          title={fullName || t('profile')}
          variant="ghost"
        >
          <Avatar className="size-7 rounded-full">
            <Avatar.Image
              alt={fullName}
              src={readImage(currentUser?.details?.avatar || '')}
            />
            <Avatar.Fallback className="rounded-full">
              {fullName.slice(0, 1)}
            </Avatar.Fallback>
          </Avatar>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="ml-2 space-y-1" side="right">
        <OrganizationMenuContent onLogout={onLogout} version={version} />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export function Organization({ compact = false }: OrganizationProps) {
  const [currentOrganization] = useAtom(currentOrganizationState);
  const setActivePlugin = useSetAtom(activePluginState);
  const { handleLogout } = useAuth();
  const version = useAppVersion();
  const { t } = useTranslation('organization');

  const hasOrgName =
    !!currentOrganization?.name || !!currentOrganization?.orgShortName;

  if (compact) {
    return (
      <CompactOrganizationMenu onLogout={handleLogout} version={version} />
    );
  }

  return (
    <div className="flex w-full items-stretch gap-1">
      <Link
        to={AppPath.Index}
        aria-label={t('home')}
        onClick={() => setActivePlugin(null)}
        className="flex min-w-0 flex-4 items-center gap-2 rounded p-1 transition-colors hover:bg-accent-foreground/10"
      >
        <div className="flex size-8 flex-none items-center justify-center overflow-hidden rounded-lg shadow-xs">
          <OrgLogoIcon className="size-7 flex-none text-primary" />
        </div>
        <TextOverflowTooltip
          value={
            currentOrganization?.name ||
            currentOrganization?.orgShortName ||
            'erxes'
          }
          className={cn('text-sm font-medium', {
            'font-normal text-accent-foreground': !hasOrgName,
          })}
        />
      </Link>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            className="flex h-auto flex-1 items-center justify-center gap-2 rounded p-1 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent-foreground/10 focus-visible:outline-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            type="button"
            variant="ghost"
          >
            <IconDotsVertical className="text-foreground" stroke={2} />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="ml-2 space-y-1">
          <OrganizationMenuContent onLogout={handleLogout} version={version} />
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}
