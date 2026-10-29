import { Sidebar, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';

export const MemberDetailSidebar = () => {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { hasActionPermission } = usePermissionCheck();
  // Sessions show devices and IPs, gated like password resets
  const tabs = [
    'overview',
    'permissions',
    'links',
    'properties',
    ...(hasActionPermission('teamMembersResetPassword') ? ['sessions'] : []),
    'activity',
  ];

  return (
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('general')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent className="mt-2">
          <Sidebar.Menu>
            {tabs.map((tab) => (
              <Sidebar.MenuItem key={tab}>
                <Sidebar.MenuButton
                  isActive={
                    selectedTab === tab || (tab === 'overview' && !selectedTab)
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
