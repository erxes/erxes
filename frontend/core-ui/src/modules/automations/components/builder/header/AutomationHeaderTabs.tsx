import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AutomationBuilderTabsType,
  AutomationsHotKeyScope,
} from '@/automations/types';
import {
  IconAutomation,
  IconChartBar,
  IconHistory,
  TablerIcon,
} from '@tabler/icons-react';
import { Tabs, usePreviousHotkeyScope, useScopedHotkeys } from 'erxes-ui';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

const TABS: { value: AutomationBuilderTabsType; icon: TablerIcon }[] = [
  { value: AutomationBuilderTabsType.Builder, icon: IconAutomation },
  { value: AutomationBuilderTabsType.History, icon: IconHistory },
  { value: AutomationBuilderTabsType.Stats, icon: IconChartBar },
];

export const AutomationHeaderTabs = ({
  toggleTabs,
}: {
  toggleTabs: (tab: AutomationBuilderTabsType) => void;
}) => {
  const { queryParams, isCreatePage } = useAutomation();

  const { t } = useTranslation('automations');

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const openTab = (tab: AutomationBuilderTabsType) => {
    if (queryParams.activeTab !== tab) {
      toggleTabs(tab);
      setHotkeyScopeAndMemorizePreviousScope(AutomationsHotKeyScope.Builder);
    }
  };

  useScopedHotkeys(
    `mod+shift+h`,
    () => openTab(AutomationBuilderTabsType.History),
    AutomationsHotKeyScope.Builder,
  );

  useScopedHotkeys(
    `mod+shift+esc`,
    () => openTab(AutomationBuilderTabsType.Builder),
    AutomationsHotKeyScope.Builder,
  );

  const activeTab = queryParams.activeTab || AutomationBuilderTabsType.Builder;

  if (isCreatePage) {
    return null;
  }

  return (
    <Tabs.List className="relative h-7 shrink-0 rounded-md border-b-none border-none bg-foreground/5 p-0">
      {TABS.map(({ value, icon: Icon }) => (
        <Tabs.Trigger
          key={value}
          className="relative z-10 min-w-24 cursor-pointer gap-1.5 rounded-md px-3 font-normal text-muted-foreground transition-colors after:border-none after:shadow-none after:content-none hover:bg-transparent data-[state=active]:text-foreground"
          value={value}
          onClick={() => toggleTabs(value)}
        >
          {activeTab === value && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-md bg-background shadow-sm"
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
            />
          )}
          <Icon className="relative z-10 size-3.5 shrink-0" />
          {/* capitalize so a missing translation still reads as a label */}
          <span className="relative z-10 whitespace-nowrap capitalize">
            {t(value)}
          </span>
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  );
};
