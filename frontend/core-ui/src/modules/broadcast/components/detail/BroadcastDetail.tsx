import { useState } from 'react';
import { useBroadcastMessage } from '../../hooks/useBroadcastMessage';
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

const BASE_TABS: BROADCAST_TAB[] = ['statistic', 'preview'];

export const BroadcastDetail = ({
  messageId,
}: {
  messageId: string | null;
}) => {
  const { message } = useBroadcastMessage({
    variables: { _id: messageId },
    skip: !messageId,
  });

  const [activeTab, setActiveTab] = useState<BROADCAST_TAB>('statistic');

  const tabs: BROADCAST_TAB[] = [...BASE_TABS, 'recipients', 'log'];

  const BroadcastTabContent =
    BROADCAST_TAB_CONTENTS[tabs.includes(activeTab) ? activeTab : 'statistic'];

  return (
    <div className="flex-auto flex h-full min-h-0">
      <BroadcastDetailSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
      />

      <BroadcastTabContent message={message} />
    </div>
  );
};
