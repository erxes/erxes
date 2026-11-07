import { Can, PrintDocument, RecordSidePanel } from 'ui-modules';
import {
  IconActivity,
  IconChartBar,
  IconEye,
  IconUsers,
} from '@tabler/icons-react';
import { campaignActions } from '../../utils/campaignActions';
import { Skeleton, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastDetail } from '../../context/BroadcastDetailContext';
import { BroadcastErrorState } from '../list/BroadcastStates';
import { BroadcastTabLogContent } from './tabs/BroadcastTabLogContent';
import { BroadcastTabPreviewContent } from './tabs/BroadcastTabPreviewContent';
import { BroadcastTabRecipientsContent } from './tabs/BroadcastTabRecipientsContent';
import { BroadcastTabStatisticContent } from './tabs/BroadcastTabStatisticContent';

const BROADCAST_DETAIL_TABS = [
  {
    value: 'statistic',
    labelKey: 'tab.statistic',
    icon: IconChartBar,
    Content: BroadcastTabStatisticContent,
  },
  {
    value: 'preview',
    labelKey: 'tab.preview',
    icon: IconEye,
    Content: BroadcastTabPreviewContent,
  },
  {
    value: 'recipients',
    labelKey: 'tab.recipients',
    icon: IconUsers,
    Content: BroadcastTabRecipientsContent,
  },
  {
    value: 'log',
    labelKey: 'tab.traces',
    icon: IconActivity,
    Content: BroadcastTabLogContent,
  },
];

export const BroadcastDetail = () => {
  const { t } = useTranslation('broadcasts');
  const { message, loading, error, refetch } = useBroadcastDetail();
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  if (loading && !message) {
    return <Skeleton className="m-5 h-[32rem] flex-1" />;
  }

  if (error) {
    return <BroadcastErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!message) {
    return <BroadcastErrorState error={new Error(t('error.not-found'))} />;
  }

  const activeTab = BROADCAST_DETAIL_TABS.some(
    ({ value }) => value === selectedTab,
  )
    ? selectedTab || 'statistic'
    : 'statistic';

  return (
    <RecordSidePanel.Layout
      expanded={false}
      value={activeTab}
      onValueChange={setSelectedTab}
      visibleCount={4}
      tabs={BROADCAST_DETAIL_TABS.map(({ value, labelKey, icon, Content }) => ({
        value,
        label: t(labelKey),
        icon,
        content: (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
            {!campaignActions(message).locked && (
              <Can action="documentsRead">
                <div className="flex flex-none flex-wrap items-center gap-2 px-5 pt-4 pb-2">
                  <PrintDocument items={[]} contentType="core:broadcast" />
                </div>
              </Can>
            )}
            <Content message={message} />
          </div>
        ),
      }))}
    />
  );
};
