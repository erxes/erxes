import { IconDeviceLaptop, IconMoon, IconSun } from '@tabler/icons-react';
import { ThemeOption, themeState, ToggleGroup, Tooltip } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const isThemeOption = (value: string): value is ThemeOption =>
  value === 'light' || value === 'dark' || value === 'system';

export const ThemeSelector = () => {
  const [theme, setTheme] = useAtom(themeState);
  const { t } = useTranslation('organization');

  return (
    <div className="flex h-7 items-center gap-2 px-2 text-sm font-medium">
      {t('theme')}
      <Tooltip.Provider delayDuration={100}>
        <ToggleGroup
          className="ml-auto h-6 gap-0.5 rounded bg-accent text-accent-foreground"
          onValueChange={(value) => {
            if (value && isThemeOption(value)) {
              setTheme(value);
            }
          }}
          size="sm"
          type="single"
          value={theme}
        >
          <Tooltip>
            <ToggleGroup.Item
              asChild
              className="h-full min-w-6 px-1 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              value="light"
            >
              <Tooltip.Trigger>
                <IconSun />
              </Tooltip.Trigger>
            </ToggleGroup.Item>
            <Tooltip.Content alignOffset={4}>{t('light')}</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <ToggleGroup.Item
              asChild
              className="h-full min-w-6 px-1 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              value="dark"
            >
              <Tooltip.Trigger>
                <IconMoon />
              </Tooltip.Trigger>
            </ToggleGroup.Item>
            <Tooltip.Content alignOffset={4}>{t('dark')}</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <ToggleGroup.Item
              asChild
              className="h-full min-w-6 px-1 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              value="system"
            >
              <Tooltip.Trigger>
                <IconDeviceLaptop />
              </Tooltip.Trigger>
            </ToggleGroup.Item>
            <Tooltip.Content alignOffset={4}>{t('system')}</Tooltip.Content>
          </Tooltip>
        </ToggleGroup>
      </Tooltip.Provider>
    </div>
  );
};
