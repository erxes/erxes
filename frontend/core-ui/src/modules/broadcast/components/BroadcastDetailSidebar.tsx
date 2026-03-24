import { Sidebar } from 'erxes-ui';

const BROADCAST_SIDEBAR_TABS = {
  statistic: 'Statistic',
  preview: 'Preview',
  log: 'Log Message',
};

export type BROADCAST_TAB = keyof typeof BROADCAST_SIDEBAR_TABS;

export const BroadcastDetailSidebar = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: BROADCAST_TAB;
  setActiveTab: (activeTab: BROADCAST_TAB) => void;
}) => {
  return (
    <Sidebar
      collapsible="none"
      className="border-r flex-none [--sidebar-width:200px]"
    >
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(BROADCAST_SIDEBAR_TABS).map(([key, value]) => (
              <Sidebar.MenuItem key={key}>
                <Sidebar.MenuButton
                  isActive={activeTab === key}
                  onClick={() => setActiveTab(key as BROADCAST_TAB)}
                  className="capitalize"
                  disabled={key === 'log'}
                >
                  {value}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
