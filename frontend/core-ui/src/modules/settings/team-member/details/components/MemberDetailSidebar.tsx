import { Sidebar, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MemberPermissionsGate } from './MemberPermissionsGate';

export const MemberDetailSidebar = () => {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  return (
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('general')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent className="mt-2">
          <Sidebar.Menu>
            {[
              'overview',
              'structure',
              'permissions',
              'links',
              'properties',
              'activity',
            ].map((tab) => {
              const item = (
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
              );

              return tab === 'permissions' ? (
                <MemberPermissionsGate key={tab}>{item}</MemberPermissionsGate>
              ) : (
                item
              );
            })}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
  );
};
