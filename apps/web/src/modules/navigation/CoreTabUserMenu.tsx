import { paths } from '~/lib/paths';
import { IconChevronRight, IconDeviceLaptop, IconMoon, IconSun } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  DropdownMenu,
  ThemeOption,
  themeState,
  ToggleGroup,
  Tooltip,
  LANGUAGES,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSession, useSignOut } from '~/modules/auth/session';
import { CoreTabTooltip } from './CoreTabTooltip';

/** Name and email at the top of the menu. */
const UserIdentity = () => {
  const { user } = useSession();

  return (
    <div className="flex min-w-0 flex-1 items-center py-2">
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{user.fullName || user.email}</span>
        <span className="truncate text-xs font-medium text-accent-foreground">{user.email}</span>
      </div>
    </div>
  );
};

/** Light / dark / system as a three-icon toggle. */
const ThemeSelector = () => {
  const [theme, setTheme] = useAtom(themeState);
  const { t } = useTranslation('organization');

  const options: { value: ThemeOption; label: string; icon: typeof IconSun }[] = [
    { value: 'light', label: t('light'), icon: IconSun },
    { value: 'dark', label: t('dark'), icon: IconMoon },
    { value: 'system', label: t('system'), icon: IconDeviceLaptop },
  ];

  return (
    <div className="flex h-7 items-center gap-2 px-2 text-sm font-medium">
      {t('theme')}
      <Tooltip.Provider delay={100}>
        <ToggleGroup
          variant="outline"
          className="ml-auto"
          onValueChange={([next]) => {
            const option = ThemeOption.safeParse(next);

            if (option.success) setTheme(option.data);
          }}
          size="icon-sm"
          value={[theme]}
        >
          {options.map(({ value, label, icon: Icon }) => (
            <Tooltip key={value}>
              <ToggleGroup.Item render={<Tooltip.Trigger />} value={value}>
                <Icon />
              </ToggleGroup.Item>
              <Tooltip.Content alignOffset={4}>{label}</Tooltip.Content>
            </Tooltip>
          ))}
        </ToggleGroup>
      </Tooltip.Provider>
    </div>
  );
};

/** Language submenu. */
const SelectLanguages = () => {
  const { t, i18n } = useTranslation('organization');

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className="h-7">
        {t('language')}
        <IconChevronRight className="ml-auto" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent className="min-w-56" sideOffset={8}>
        <DropdownMenu.RadioGroup
          value={i18n.language}
          onValueChange={(value) => void i18n.changeLanguage(value)}
        >
          {LANGUAGES.map((language) => (
            <DropdownMenu.RadioItem key={language.code} value={language.code}>
              {language.label}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
};

/** The avatar at the end of the top bar. */
export const CoreTabUserMenu = () => {
  const { user } = useSession();
  const signOut = useSignOut();
  const { t } = useTranslation('organization');
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });
  const userName = user.fullName || sidebarT('profile');

  return (
    <DropdownMenu>
      <CoreTabTooltip label={userName}>
        <DropdownMenu.Trigger
          render={
            <Button
              aria-label={sidebarT('profile')}
              className="relative shrink-0"
              size="icon"
              variant="nav"
            />
          }
        >
          <Avatar corners="square" className="size-6">
            {user.avatarUrl && <Avatar.Image src={user.avatarUrl} alt={userName} />}
            <Avatar.Fallback>{userName.charAt(0)}</Avatar.Fallback>
          </Avatar>
        </DropdownMenu.Trigger>
      </CoreTabTooltip>
      <DropdownMenu.Content align="end" className="w-56 min-w-56!" side="bottom" sideOffset={8}>
        <DropdownMenu.LinkItem render={<Link to={paths.settings.profile} />}>
          <UserIdentity />
          <IconChevronRight className="text-muted-foreground" />
        </DropdownMenu.LinkItem>
        <DropdownMenu.Separator />
        <ThemeSelector />
        <SelectLanguages />
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="h-7"
          disabled={signOut.isPending}
          onClick={() => signOut.mutate()}
        >
          {t('logout')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
