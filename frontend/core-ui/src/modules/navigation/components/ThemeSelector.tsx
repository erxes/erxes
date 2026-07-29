import {
  IconChevronRight,
  IconDeviceLaptop,
  IconMoon,
  IconPalette,
  IconSun,
} from '@tabler/icons-react';
import { DropdownMenu, ThemeOption, themeState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const isThemeOption = (value: string): value is ThemeOption =>
  value === 'light' || value === 'dark' || value === 'system';

export const ThemeSelector = () => {
  const [theme, setTheme] = useAtom(themeState);
  const { t } = useTranslation('organization');

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className="h-9">
        <IconPalette />
        {t('change-theme')}
        <IconChevronRight className="ml-auto" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className="min-w-44" sideOffset={8}>
          <DropdownMenu.RadioGroup
            value={theme}
            onValueChange={(value) => {
              if (isThemeOption(value)) {
                setTheme(value);
              }
            }}
          >
            <DropdownMenu.RadioItem value="light">
              <IconSun />
              {t('light')}
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="dark">
              <IconMoon />
              {t('dark')}
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="system">
              <IconDeviceLaptop />
              {t('system')}
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
};
