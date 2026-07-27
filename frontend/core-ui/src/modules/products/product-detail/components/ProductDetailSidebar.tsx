import { Sidebar, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ProductDetailSidebar = () => {
  const { t } = useTranslation('product');
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  const tabs = ['overview', 'properties', 'activity', 'similarity'];

  return (
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('general', 'General')}</Sidebar.GroupLabel>
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
