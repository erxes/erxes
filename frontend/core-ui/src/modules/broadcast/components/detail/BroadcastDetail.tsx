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
import { BroadcastPrintDocument } from './BroadcastPrintDocument';
import { campaignActions } from '../../utils/campaignActions';
import { Can } from 'ui-modules';

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

      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {!campaignActions(message).locked && (
          <Can action="documentsRead">
            <div className="flex flex-wrap items-center gap-2 px-8 pt-5">
              <BroadcastPrintDocument />
            </div>
          </Can>
        )}
        <BroadcastTabContent message={message} />
      </div>
    </div>
  );
};
