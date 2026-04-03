import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AutomationBuilderTabsType,
  AutomationsHotKeyScope,
} from '@/automations/types';
import { Tabs, usePreviousHotkeyScope, useScopedHotkeys } from 'erxes-ui';
import { motion } from 'motion/react';

export const AutomationHeaderTabs = ({
  toggleTabs,
}: {
  toggleTabs: (tab: AutomationBuilderTabsType) => void;
}) => {
  const { queryParams } = useAutomation();

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const openHistory = () => {
    if (queryParams.activeTab !== 'history') {
      toggleTabs(AutomationBuilderTabsType.History);
      setHotkeyScopeAndMemorizePreviousScope(AutomationsHotKeyScope.Builder);
    }
  };

  const openBuilder = () => {
    if (queryParams.activeTab !== 'builder') {
      toggleTabs(AutomationBuilderTabsType.Builder);
      setHotkeyScopeAndMemorizePreviousScope(AutomationsHotKeyScope.Builder);
    }
  };

  useScopedHotkeys(
    `mod+shift+h`,
    () => openHistory(),
    AutomationsHotKeyScope.Builder,
  );

  useScopedHotkeys(
    `mod+shift+esc`,
    () => openBuilder(),
    AutomationsHotKeyScope.Builder,
  );

  const activeTab = queryParams.activeTab || 'builder';

  return (
    <Tabs.List className="bg-foreground/5 rounded-md border-b-none border-none h-7 p-0 relative shrink-0">
      <Tabs.Trigger
        className="w-24 font-normal after:content-none after:border-none after:shadow-none text-muted-foreground data-[state=active]:text-foreground hover:bg-transparent rounded-md transition-colors cursor-pointer relative z-10"
        value="builder"
        onClick={() => toggleTabs(AutomationBuilderTabsType.Builder)}
      >
        {activeTab === 'builder' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-background shadow-sm rounded-md"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
          />
        )}
        <span className="relative z-10">Builder</span>
      </Tabs.Trigger>
      <Tabs.Trigger
        className="w-24 font-normal after:content-none after:border-none after:shadow-none text-muted-foreground data-[state=active]:text-foreground hover:bg-transparent rounded-md transition-colors cursor-pointer relative z-10"
        value="history"
        onClick={() => toggleTabs(AutomationBuilderTabsType.History)}
      >
        {activeTab === 'history' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-background shadow-sm rounded-md"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
          />
        )}
        <span className="relative z-10">History</span>
      </Tabs.Trigger>
    </Tabs.List>
  );
};
