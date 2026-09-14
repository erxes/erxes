import { Sidebar } from 'erxes-ui';

const BROADCAST_SIDEBAR_TABS = {
  statistic: 'Statistic',
  preview: 'Preview',
  history: 'Run history',
  log: 'Traces',
};

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
  return (
    <Sidebar
      collapsible="none"
      className="border-r flex-none [--sidebar-width:200px]"
    >
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {tabs.map((key) => (
              <Sidebar.MenuItem key={key}>
                <Sidebar.MenuButton
                  isActive={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className="capitalize"
                  disabled={false}
                >
                  {BROADCAST_SIDEBAR_TABS[key]}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
