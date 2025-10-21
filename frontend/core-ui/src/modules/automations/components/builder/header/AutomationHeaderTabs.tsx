import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AutomationBuilderTabsType,
  AutomationsHotKeyScope,
} from '@/automations/types';
import { Tabs, usePreviousHotkeyScope, useScopedHotkeys } from 'erxes-ui';

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

  return (
    <Tabs.List className="bg-accent rounded border-b-none px-1 border-none">
      <Tabs.Trigger
        className="w-24 font-normal after:content-none after:border-none after:shadow-none data-[state=active]:bg-background data-[state=active]:shadow data-[state=active]:text-foreground"
        value="builder"
        onClick={() => toggleTabs(AutomationBuilderTabsType.Builder)}
      >
        Builder
      </Tabs.Trigger>
      <Tabs.Trigger
        className="w-24 font-normal after:content-none after:border-none after:shadow-none data-[state=active]:bg-background data-[state=active]:shadow data-[state=active]:text-foreground"
        value="history"
        onClick={() => toggleTabs(AutomationBuilderTabsType.History)}
      >
        History
      </Tabs.Trigger>
    </Tabs.List>
  );
};
