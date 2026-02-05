import { Sidebar, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const CP_USER_DETAIL_TABS = ['overview', 'activity', 'notifications'] as const;

const TAB_LABELS: Record<(typeof CP_USER_DETAIL_TABS)[number], string> = {
  overview: 'Overview',
  activity: 'Activity log',
  notifications: 'Notifications',
};

export function CPUserDetailSidebar() {
  const { t } = useTranslation('contact', {
    keyPrefix: 'clientPortalUser.detail',
  });
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  return (
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>General</Sidebar.GroupLabel>
        <Sidebar.GroupContent className="mt-2">
          <Sidebar.Menu>
            {CP_USER_DETAIL_TABS.map((tab) => (
              <Sidebar.MenuItem key={tab}>
                <Sidebar.MenuButton
                  isActive={
                    selectedTab === tab || (tab === 'overview' && !selectedTab)
                  }
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab === 'notifications'
                    ? t('notifications', { defaultValue: TAB_LABELS[tab] })
                    : TAB_LABELS[tab]}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
  );
}
