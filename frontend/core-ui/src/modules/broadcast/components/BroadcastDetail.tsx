import { useState } from 'react';
import { useBroadcastMessage } from '../hooks/useBroadcastMessage';
import {
  BROADCAST_TAB,
  BroadcastDetailSidebar,
} from './BroadcastDetailSidebar';
import { BroadcastTabHistoryContent } from './tab/BroadcastTabHistoryContent';
import { BroadcastTabLogContent } from './tab/BroadcastTabLogContent';
import { BroadcastTabPreviewContent } from './tab/BroadcastTabPreviewContent';
import { BroadcastTabStatisticContent } from './tab/BroadcastTabStatisticContent';

const BROADCAST_TAB_CONTENTS = {
  statistic: BroadcastTabStatisticContent,
  preview: BroadcastTabPreviewContent,
  history: BroadcastTabHistoryContent,
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

  // Only a campaign that owns a flow has runs to look through.
  const tabs: BROADCAST_TAB[] = [
    ...BASE_TABS,
    ...(message?.workflowAutomationId ? (['history'] as const) : []),
    'log',
  ];

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
