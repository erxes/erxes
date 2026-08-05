import { Sidebar, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const TICKET_DETAIL_TABS = [
  { value: 'overview', labelKey: 'overview' },
  { value: 'properties', labelKey: 'properties' },
] as const;

export const TicketSidebar = () => {
  const { t } = useTranslation('frontline');
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  return (
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('general')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent className="mt-2">
          <Sidebar.Menu>
            {TICKET_DETAIL_TABS.map((tab) => (
              <Sidebar.MenuItem key={tab.value}>
                <Sidebar.MenuButton
                  isActive={
                    selectedTab === tab.value ||
                    (tab.value === 'overview' && !selectedTab)
                  }
                  onClick={() => setSelectedTab(tab.value)}
                >
                  {t(tab.labelKey)}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
  );
};
