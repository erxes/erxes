import { Sidebar, Tabs, useQueryState } from 'erxes-ui';
import React from 'react';

interface Props {
  children?: React.ReactNode;
}

export const SalesDetailLeftSidebar = ({ children }: Props) => {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  const groups = [
    {
      label: 'General',
      tabs: [{ label: 'Overview', value: 'overview' }],
    },
    {
      label: 'Title',
      tabs: [{ label: 'Products', value: 'products' }],
    },
  ];

  return (
    <Tabs
      value={selectedTab ?? 'overview'}
      onValueChange={setSelectedTab}
      className="flex h-full w-full"
      orientation="vertical"
    >
      <Tabs.List className="w-64" asChild>
        <Sidebar
          collapsible="none"
          className="flex-none w-80 border-r justify-start"
        >
          {groups.map((group) => (
            <Sidebar.Group
              key={group.label}
              className={
                group.label === 'General'
                  ? 'border-b border-gray-200 pb-3 mb-3'
                  : ''
              }
            >
              <Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  {group.tabs.map((tab) => (
                    <Sidebar.MenuItem key={tab.value}>
                      <Tabs.Trigger value={tab.value} asChild>
                        <Sidebar.MenuButton className="justify-start">
                          {tab.label}
                        </Sidebar.MenuButton>
                      </Tabs.Trigger>
                    </Sidebar.MenuItem>
                  ))}
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          ))}
        </Sidebar>
      </Tabs.List>

      <div className="flex-1 flex flex-col overflow-auto">{children}</div>
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
    <Tabs.Content value={value} className="flex-1 overflow-auto">
      {children}
    </Tabs.Content>
  );
};
