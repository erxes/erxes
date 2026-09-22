import { Sidebar, Tabs, useQueryState } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const SalesDetailLeftSidebar = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { t } = useTranslation('sales');

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
            <Sidebar.GroupLabel>{t('general')}</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Tabs.Trigger value="overview" asChild>
                    <Sidebar.MenuButton className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      {t('overview')}
                    </Sidebar.MenuButton>
                  </Tabs.Trigger>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>

          <Sidebar.Separator />

          <Sidebar.Group>
            <Sidebar.GroupLabel>{t('plugins')}</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Tabs.Trigger value="products" asChild>
                    <Sidebar.MenuButton className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      {t('products')}
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
    <Tabs.Content value={value} className="flex-auto overflow-auto relative">
      {children}
    </Tabs.Content>
  );
};
