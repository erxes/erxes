import { TAiAgentConfigTab } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentConfigTabs';
import {
  IconBrain,
  IconChartPie,
  IconListDetails,
  IconSettings,
  TablerIcon,
} from '@tabler/icons-react';
import { Button, Popover, Tabs, Tooltip } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const AI_AGENT_CONFIG_RAIL_ITEMS: {
  value: TAiAgentConfigTab;
  labelKey: string;
  icon: TablerIcon;
}[] = [
  { value: 'setup', labelKey: 'ai-agent-setup', icon: IconSettings },
  { value: 'output', labelKey: 'ai-agent-output', icon: IconListDetails },
  { value: 'memory', labelKey: 'memory', icon: IconBrain },
];

// Section switcher as an icon column, so output's own tabs are the only row
// of tabs in the panel. Active state keys off aria-selected: the tooltip
// trigger overwrites the tab's data-state.
export const AiAgentConfigRail = ({
  outputCount,
  snapshot,
}: {
  outputCount: number;
  snapshot: ReactNode;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="shrink-0 border-l bg-muted/30">
      <Tooltip.Provider>
        <div className="sticky top-0 flex flex-col items-center gap-1 p-1.5">
          <Tabs.List className="flex flex-col gap-1 border-none p-0">
            {AI_AGENT_CONFIG_RAIL_ITEMS.map(
              ({ value, labelKey, icon: Icon }) => (
                <Tooltip key={value}>
                  <Tooltip.Trigger asChild>
                    <Tabs.Trigger
                      value={value}
                      aria-label={t(labelKey)}
                      className="relative size-8 p-0 text-muted-foreground after:hidden hover:text-foreground aria-selected:bg-primary/15 aria-selected:text-primary aria-selected:hover:bg-primary/20 aria-selected:hover:text-primary"
                    >
                      <Icon className="size-4" />
                      {value === 'output' && outputCount > 0 && (
                        <span className="absolute -right-1 -top-1 min-w-4 rounded-sm border bg-background px-0.5 text-[10px] leading-4 text-muted-foreground">
                          {outputCount}
                        </span>
                      )}
                    </Tabs.Trigger>
                  </Tooltip.Trigger>
                  <Tooltip.Content side="left">{t(labelKey)}</Tooltip.Content>
                </Tooltip>
              ),
            )}
          </Tabs.List>
          <div className="my-1 h-px w-6 bg-border" />
          <Popover>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Popover.Trigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={t('runtime-snapshot')}
                  >
                    <IconChartPie className="size-4" />
                  </Button>
                </Popover.Trigger>
              </Tooltip.Trigger>
              <Tooltip.Content side="left">
                {t('runtime-snapshot')}
              </Tooltip.Content>
            </Tooltip>
            <Popover.Content side="left" align="start" className="w-80 p-0">
              {snapshot}
            </Popover.Content>
          </Popover>
        </div>
      </Tooltip.Provider>
    </div>
  );
};
