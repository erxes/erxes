import { Tabs as TabsPrimitive } from 'radix-ui';
import React from 'react';
import {
  Button,
  cn,
  Resizable,
  Sheet,
  Sidebar,
  Spinner,
  Tabs,
  useQueryState,
} from 'erxes-ui';
import { MemberDetailSheet } from './MemberDetailSheet';
import { IconMoodAnnoyed } from '@tabler/icons-react';

export const MemberDetailLayout = ({
  children,
  actions,
  otherState,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  otherState?: 'loading' | 'not-found';
}) => {
  return (
    <MemberDetailSheet
      className={!otherState ? undefined : 'sm:max-w-screen-lg'}
    >
      <Sheet.Content>
        {otherState === 'loading' && (
          <div className="flex items-center justify-center h-full">
            <Spinner size={'lg'} />
          </div>
        )}
        {otherState === 'not-found' && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <IconMoodAnnoyed className="w-16 h-16 text-muted-foreground" />
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold w-full text-center">
                  Member details not found
                </h2>
                <p className="text-muted-foreground font-medium text-base w-full text-center">
                  There seems to be no data on this member
                </p>
              </div>
              <Sheet.Close asChild>
                <Button variant="outline">Close</Button>
              </Sheet.Close>
            </div>
          </div>
        )}
        {!otherState && (
          <div className="flex h-full flex-auto overflow-auto">
            <div className="flex flex-col flex-auto min-h-full overflow-hidden">
              <Resizable.PanelGroup
                direction="horizontal"
                className="flex-auto min-h-full overflow-hidden"
              >
                <Resizable.Panel defaultSize={75} minSize={30}>
                  <MemberDetailTabs>{children}</MemberDetailTabs>
                </Resizable.Panel>
                {actions}
              </Resizable.PanelGroup>
            </div>
          </div>
        )}
      </Sheet.Content>
    </MemberDetailSheet>
  );
};

const MemberDetailTabs = ({ children }: { children: React.ReactNode }) => {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  return (
    <Tabs
      value={selectedTab ?? 'overview'}
      onValueChange={setSelectedTab}
      className="flex-auto flex h-full"
      orientation="vertical"
    >
      <Tabs.List className="w-64" asChild>
        <Sidebar collapsible="none" className="flex-none w-64 border-r">
          <Sidebar.Group>
            <Sidebar.GroupLabel>General</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <TabsPrimitive.Trigger value="overview" asChild>
                    <Sidebar.MenuButton className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      Overview
                    </Sidebar.MenuButton>
                  </TabsPrimitive.Trigger>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <TabsPrimitive.Trigger value="links" asChild>
                    <Sidebar.MenuButton>Links</Sidebar.MenuButton>
                  </TabsPrimitive.Trigger>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <TabsPrimitive.Trigger value="properties" asChild>
                    <Sidebar.MenuButton>Properties</Sidebar.MenuButton>
                  </TabsPrimitive.Trigger>
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

export const MemberDetailTabContent = ({
  children,
  value,
  className,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) => {
  return (
    <Tabs.Content
      value={value}
      className={cn(className, 'flex-auto overflow-hidden')}
    >
      {children}
    </Tabs.Content>
  );
};
