import { IconChevronRight, IconDeviceLaptop, IconMoon, IconSun } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  DropdownMenu,
  type ThemeOption,
  themeState,
  ToggleGroup,
  Tooltip,
} from 'erxes-ui';
import { INTL_LANGUAGES } from 'erxes-ui/constants/IntlLanguages';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LANGUAGES, type LanguageCode } from '~/i18n';
import { useSession, useSignOut } from '~/modules/auth/session';
import { CoreTabTooltip } from './CoreTabTooltip';

const isThemeOption = (value: string): value is ThemeOption =>
  value === 'light' || value === 'dark' || value === 'system';

/** Name and email at the top of the menu. */
const UserIdentity = () => {
  const { user } = useSession();

  return (
    <div className="flex min-w-0 flex-1 items-center">
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
          className="ml-auto h-6 gap-0.5 rounded bg-accent text-accent-foreground"
          onValueChange={([next]) => {
            if (next && isThemeOption(next)) setTheme(next);
          }}
          size="sm"
          value={[theme]}
        >
          {options.map(({ value, label, icon: Icon }) => (
            <Tooltip key={value}>
              <ToggleGroup.Item
                render={<Tooltip.Trigger />}
                className="h-full min-w-6 px-1 data-pressed:bg-background data-pressed:shadow-sm"
                value={value}
              >
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

/** The language's own name from the browser locale list (`mn` → Mongolian). */
const languageName = (code: LanguageCode) =>
  Object.entries(INTL_LANGUAGES).find(([, locale]) => locale.startsWith(`${code}-`))?.[0] ?? code;

/** Language submenu. */
const SelectLanguages = () => {
  const { t, i18n } = useTranslation('organization');

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className="h-7 py-0">
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
              {languageName(language.code)}
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
          <Avatar className="size-6 rounded-md">
            {user.avatarUrl && <Avatar.Image src={user.avatarUrl} alt={userName} />}
            <Avatar.Fallback className="rounded-md text-xs">{userName.charAt(0)}</Avatar.Fallback>
          </Avatar>
        </DropdownMenu.Trigger>
      </CoreTabTooltip>
      <DropdownMenu.Content
        align="end"
        className="w-56 min-w-56! space-y-1 p-1.5"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenu.LinkItem className="p-2" render={<Link to="/settings/profile" />}>
          <UserIdentity />
          <IconChevronRight className="text-muted-foreground" />
        </DropdownMenu.LinkItem>
        <DropdownMenu.Separator />
        <ThemeSelector />
        <SelectLanguages />
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="h-7 py-0 text-sm"
          disabled={signOut.isPending}
          onClick={() => signOut.mutate()}
        >
          {t('logout')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
