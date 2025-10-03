import { IconDeviceLaptop, IconMoon, IconSun } from '@tabler/icons-react';
import { ToggleGroup, Tooltip } from 'erxes-ui';
import { ThemeOption, themeState } from 'erxes-ui';
import { useAtom } from 'jotai';

export const ThemeSelector = () => {
  const [theme, setTheme] = useAtom(themeState);

  return (
    <div className="flex items-center gap-2 px-2 font-medium h-7">
      Change Theme
      <Tooltip.Provider delayDuration={100}>
        <ToggleGroup
          value={theme}
          type="single"
          size="sm"
          className="ml-auto h-6 bg-accent rounded gap-0.5 text-accent-foreground"
          onValueChange={(value) => setTheme(value as ThemeOption)}
        >
          <Tooltip>
            <ToggleGroup.Item
              value="light"
              className="data-[state=on]:bg-background h-full data-[state=on]:shadow-sm px-1 min-w-6"
              asChild
            >
              <Tooltip.Trigger>
                <IconSun />
              </Tooltip.Trigger>
            </ToggleGroup.Item>
            <Tooltip.Content alignOffset={4}>Light</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <ToggleGroup.Item
              value="dark"
              className="data-[state=on]:bg-background h-full data-[state=on]:shadow-sm px-1 min-w-6"
              asChild
            >
              <Tooltip.Trigger>
                <IconMoon />
              </Tooltip.Trigger>
            </ToggleGroup.Item>
            <Tooltip.Content alignOffset={4}>Dark</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <ToggleGroup.Item
              value="system"
              className="data-[state=on]:bg-background h-full data-[state=on]:shadow-sm px-1 min-w-6"
              asChild
            >
              <Tooltip.Trigger>
                <IconDeviceLaptop />
              </Tooltip.Trigger>
            </ToggleGroup.Item>

            <Tooltip.Content alignOffset={4}>System</Tooltip.Content>
          </Tooltip>
        </ToggleGroup>
      </Tooltip.Provider>
    </div>
  );
};
