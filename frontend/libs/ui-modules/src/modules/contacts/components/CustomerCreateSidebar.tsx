import { Sidebar, useQueryState } from 'erxes-ui';

const TABS = ['overview', 'properties'];

export const CustomerCreateSidebar = () => {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  return (
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>General</Sidebar.GroupLabel>
        <Sidebar.GroupContent className="mt-2">
          <Sidebar.Menu>
            {TABS.map((tab) => (
              <Sidebar.MenuItem key={tab}>
                <Sidebar.MenuButton
                  isActive={
                    selectedTab === tab ||
                    (tab === 'overview' && !selectedTab)
                  }
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
  );
};
