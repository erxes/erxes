import { useState } from 'react';
import { useBroadcastMessage } from '../hooks/useBroadcastMessage';
import {
  BROADCAST_TAB,
  BroadcastDetailSidebar,
} from './BroadcastDetailSidebar';
import { BroadcastTabLogContent } from './tab/BroadcastTabLogContent';
import { BroadcastTabPreviewContent } from './tab/BroadcastTabPreviewContent';
import { BroadcastTabStatisticContent } from './tab/BroadcastTabStatisticContent';

const BROADCAST_TAB_CONTENTS = {
  statistic: BroadcastTabStatisticContent,
  preview: BroadcastTabPreviewContent,
  log: BroadcastTabLogContent,
};

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

  const BroadcastTabContent = BROADCAST_TAB_CONTENTS[activeTab];

  return (
    <div className="flex-auto flex h-full">
      <BroadcastDetailSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <BroadcastTabContent message={message} />
    </div>
  );
};
