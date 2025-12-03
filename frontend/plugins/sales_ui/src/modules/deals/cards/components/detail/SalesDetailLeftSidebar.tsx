import { Sidebar, Tabs, useQueryState } from 'erxes-ui';

export const SalesDetailLeftSidebar = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  return (
    <Tabs
      value={selectedTab ?? 'overview'}
      onValueChange={setSelectedTab}
      className="flex-auto flex h-full"
      orientation="vertical"
    >
      <Tabs.List className="w-64" asChild>
        <Sidebar
          collapsible="none"
          className="flex-none w-64 border-r justify-start"
        >
          <Sidebar.Group>
            <Sidebar.GroupLabel>General</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Tabs.Trigger value="overview" asChild>
                    <Sidebar.MenuButton className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary justify-start">
                      Overview
                    </Sidebar.MenuButton>
                  </Tabs.Trigger>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
          <Sidebar.Separator />
          <Sidebar.Group>
            <Sidebar.GroupLabel>Plugins</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Tabs.Trigger value="products" asChild>
                    <Sidebar.MenuButton className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary justify-start">
                      Products
                    </Sidebar.MenuButton>
                  </Tabs.Trigger>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar>
      </Tabs.List>
      {children}
    </Tabs>
  );
};

export const SalesDetailTabContent = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) => {
  return (
    <Tabs.Content value={value} className="flex-auto overflow-auto">
      {children}
    </Tabs.Content>
  );
};
