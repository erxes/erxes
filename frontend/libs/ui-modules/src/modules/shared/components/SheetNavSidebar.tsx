import { Sidebar, useQueryState } from 'erxes-ui';

export function SheetNavSidebar({
  tabs,
  groupLabel,
  labels,
}: {
  tabs: string[];
  groupLabel: string;
  // Display names for tabs whose key is not the label to show
  labels?: Record<string, string>;
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
                  {labels?.[tab] ?? tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
  );
}
