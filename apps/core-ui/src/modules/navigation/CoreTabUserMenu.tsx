import { IconDeviceDesktop, IconLanguage, IconLogout, IconMoon, IconSun } from '@tabler/icons-react';
import { Button, cn, DropdownMenu, Spinner, type ThemeOption, themeState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '~/components/UserAvatar';
import { LANGUAGES } from '~/i18n';
import { useSession, useSignOut } from '~/modules/auth/session';
import { coreTabIconClassName } from './coreTabClassName';
import { CoreTabTooltip } from './CoreTabTooltip';

const THEMES: { value: ThemeOption; label: string; icon: typeof IconSun }[] = [
  { value: 'light', label: 'Light', icon: IconSun },
  { value: 'dark', label: 'Dark', icon: IconMoon },
  { value: 'system', label: 'System', icon: IconDeviceDesktop },
];

/** The avatar at the end of the top bar: who is signed in, theme, language, sign out. */
export const CoreTabUserMenu = () => {
  const { user, organization } = useSession();
  const signOut = useSignOut();
  const [signingOut, setSigningOut] = useState(false);
  const [theme, setTheme] = useAtom(themeState);
  const { i18n } = useTranslation();
  const name = user.fullName || user.email;
  const ThemeIcon = THEMES.find((item) => item.value === theme)?.icon ?? IconDeviceDesktop;

  return (
    <DropdownMenu>
      <CoreTabTooltip label={name}>
        <DropdownMenu.Trigger asChild>
          <Button aria-label="Account" size="icon" variant="ghost" className={cn(coreTabIconClassName(), 'p-0')}>
            <UserAvatar name={name} src={user.avatarUrl} className="size-6" />
          </Button>
        </DropdownMenu.Trigger>
      </CoreTabTooltip>
      <DropdownMenu.Content align="end" sideOffset={8} className="w-60 p-1.5">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <UserAvatar name={name} src={user.avatarUrl} className="size-8" />
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-sm font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.fullName ? user.email : organization.name}
            </span>
          </span>
        </div>
        <DropdownMenu.Separator />
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger className="h-8 gap-2 text-sm">
            <ThemeIcon className="size-4" />
            Theme
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.RadioGroup value={theme} onValueChange={(value) => setTheme(value as ThemeOption)}>
              {THEMES.map((item) => (
                <DropdownMenu.RadioItem key={item.value} value={item.value} className="h-8 text-sm">
                  {item.label}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger className="h-8 gap-2 text-sm">
            <IconLanguage className="size-4" />
            Language
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.RadioGroup
              value={i18n.language}
              onValueChange={(value) => void i18n.changeLanguage(value)}
            >
              {LANGUAGES.map((language) => (
                <DropdownMenu.RadioItem key={language.code} value={language.code} className="h-8 text-sm">
                  {language.label}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="h-8 gap-2 text-sm"
          disabled={signingOut}
          onSelect={(event) => {
            event.preventDefault();
            setSigningOut(true);
            void signOut();
          }}
        >
          {signingOut ? <Spinner size="sm" /> : <IconLogout className="size-4" />}
          Sign out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
