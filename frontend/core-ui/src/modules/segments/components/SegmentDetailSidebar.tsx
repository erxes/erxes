import { Sidebar, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SEGMENT_DETAIL_TABS = ['overview', 'definition'] as const;

export type SegmentDetailTab = (typeof SEGMENT_DETAIL_TABS)[number];

export const SegmentDetailSidebar = () => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  return (
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('segment')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent className="mt-2">
          <Sidebar.Menu>
            {SEGMENT_DETAIL_TABS.map((tab) => (
              <Sidebar.MenuItem key={tab}>
                <Sidebar.MenuButton
                  isActive={
                    selectedTab === tab || (tab === 'overview' && !selectedTab)
                  }
                  onClick={() => setSelectedTab(tab)}
                >
                  {t(tab)}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
  );
};
