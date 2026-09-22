import { Sidebar, useQueryState } from 'erxes-ui';

export function SheetNavSidebar({
  tabs,
  groupLabel,
}: {
  tabs: string[];
  groupLabel: string;
}) {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  return (
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{groupLabel}</Sidebar.GroupLabel>
        <Sidebar.GroupContent className="mt-2">
          <Sidebar.Menu>
            {tabs.map((tab, index) => (
              <Sidebar.MenuItem key={tab}>
                <Sidebar.MenuButton
                  isActive={
                    selectedTab === tab || (index === 0 && !selectedTab)
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
}
