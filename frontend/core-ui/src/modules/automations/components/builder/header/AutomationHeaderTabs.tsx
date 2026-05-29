import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AutomationBuilderTabsType,
  AutomationsHotKeyScope,
} from '@/automations/types';
import { IconAutomation, IconHistory } from '@tabler/icons-react';
import { Tabs, usePreviousHotkeyScope, useScopedHotkeys } from 'erxes-ui';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export const AutomationHeaderTabs = ({
  toggleTabs,
}: {
  toggleTabs: (tab: AutomationBuilderTabsType) => void;
}) => {
  const { queryParams, isCreatePage } = useAutomation();

  const { t } = useTranslation('automations');

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

  if (isCreatePage) {
    return null;
  }
  return (
    <Tabs.List className="relative h-7 shrink-0 rounded-md border-b-none border-none bg-foreground/5 p-0">
      <Tabs.Trigger
        className="relative z-10 min-w-24 cursor-pointer gap-1.5 rounded-md px-3 font-normal text-muted-foreground transition-colors after:border-none after:shadow-none after:content-none hover:bg-transparent data-[state=active]:text-foreground"
        value="builder"
        onClick={() => toggleTabs(AutomationBuilderTabsType.Builder)}
      >
        {activeTab === 'builder' && (
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
        <IconAutomation className="relative z-10 size-3.5 shrink-0" />
        <span className="relative z-10 whitespace-nowrap">{t('builder')}</span>
      </Tabs.Trigger>
      <Tabs.Trigger
        className="relative z-10 min-w-24 cursor-pointer gap-1.5 rounded-md px-3 font-normal text-muted-foreground transition-colors after:border-none after:shadow-none after:content-none hover:bg-transparent data-[state=active]:text-foreground"
        value="history"
        onClick={() => toggleTabs(AutomationBuilderTabsType.History)}
      >
        {activeTab === 'history' && (
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
        <IconHistory className="relative z-10 size-3.5 shrink-0" />
        <span className="relative z-10 whitespace-nowrap">{t('history')}</span>
      </Tabs.Trigger>
    </Tabs.List>
  );
};
