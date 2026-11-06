import { Can, PrintDocument } from 'ui-modules';
import { campaignActions } from '../../utils/campaignActions';
import { Skeleton } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBroadcastDetail } from '../../context/BroadcastDetailContext';
import { BroadcastErrorState } from '../list/BroadcastStates';
import {
  BROADCAST_TAB,
  BroadcastDetailSidebar,
} from './BroadcastDetailSidebar';
import { BroadcastTabLogContent } from './tabs/BroadcastTabLogContent';
import { BroadcastTabPreviewContent } from './tabs/BroadcastTabPreviewContent';
import { BroadcastTabRecipientsContent } from './tabs/BroadcastTabRecipientsContent';
import { BroadcastTabStatisticContent } from './tabs/BroadcastTabStatisticContent';

const BROADCAST_TAB_CONTENTS = {
  statistic: BroadcastTabStatisticContent,
  preview: BroadcastTabPreviewContent,
  recipients: BroadcastTabRecipientsContent,
  log: BroadcastTabLogContent,
};

export const BroadcastDetail = () => {
  const { t } = useTranslation('broadcasts');
  const { message, loading, error, refetch } = useBroadcastDetail();
  const [activeTab, setActiveTab] = useState<BROADCAST_TAB>('statistic');

  if (loading && !message) {
    return <Skeleton className="m-5 h-[32rem] flex-1" />;
  }

  if (error) {
    return <BroadcastErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!message) {
    return <BroadcastErrorState error={new Error(t('error.not-found'))} />;
  }

  const BroadcastTabContent = BROADCAST_TAB_CONTENTS[activeTab];

  return (
    <div className="flex-auto flex h-full min-h-0">
      <BroadcastDetailSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {!campaignActions(message).locked && (
          <Can action="documentsRead">
            <div className="flex flex-wrap items-center gap-2 px-5 pt-5 pb-2">
              <PrintDocument items={[]} contentType="core:broadcast" />
            </div>
          </Can>
        )}
        <BroadcastTabContent message={message} />
      </div>
    </div>
  );
};
