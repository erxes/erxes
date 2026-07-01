import { Sidebar, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MemberDetailSidebar = () => {
  const { t } = useTranslation('settings');
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  return (
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('general._', 'General')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent className="mt-2">
          <Sidebar.Menu>
            {['overview', 'permissions', 'links', 'properties', 'activity'].map(
              (tab) => (
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
              ),
            )}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
  );
};
