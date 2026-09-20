import {
  IconActivity,
  IconChartBar,
  IconEye,
  IconUsers,
  TablerIcon,
} from '@tabler/icons-react';
import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// `satisfies` rather than an annotation: the keys stay literal, so
// `BROADCAST_TAB` is the union of tab names and not `string`.
const BROADCAST_SIDEBAR_TABS = {
  statistic: { labelKey: 'tab.statistic', icon: IconChartBar },
  preview: { labelKey: 'tab.preview', icon: IconEye },
  recipients: { labelKey: 'tab.recipients', icon: IconUsers },
  log: { labelKey: 'tab.traces', icon: IconActivity },
} satisfies Record<string, { labelKey: string; icon: TablerIcon }>;

export type BROADCAST_TAB = keyof typeof BROADCAST_SIDEBAR_TABS;

export const BroadcastDetailSidebar = ({
  activeTab,
  setActiveTab,
  tabs,
}: {
  activeTab: BROADCAST_TAB;
  setActiveTab: (activeTab: BROADCAST_TAB) => void;
  // Which of the tabs this campaign has anything to show in.
  tabs: BROADCAST_TAB[];
}) => {
  const { t } = useTranslation('broadcasts');

  return (
    <Sidebar
      collapsible="none"
      className="border-r flex-none [--sidebar-width:200px]"
    >
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {tabs.map((key) => {
              const { labelKey, icon: Icon } = BROADCAST_SIDEBAR_TABS[key];

              return (
                <Sidebar.MenuItem key={key}>
                  <Sidebar.MenuButton
                    isActive={activeTab === key}
                    onClick={() => setActiveTab(key)}
                    disabled={false}
                  >
                    <Icon />
                    {t(labelKey)}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              );
            })}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
