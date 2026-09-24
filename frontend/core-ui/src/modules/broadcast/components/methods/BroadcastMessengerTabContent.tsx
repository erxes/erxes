import { IconBrandMessenger } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';

/**
 * Messenger is no longer offered when creating a campaign, but campaigns made
 * before it was withdrawn are still here and still open. This says plainly
 * that there is nothing to show rather than leaving an empty panel.
 */
export const BroadcastTabPreviewMessengerContent = () => (
  <Empty>
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconBrandMessenger />
      </Empty.Media>
      <Empty.Title>No preview for messenger</Empty.Title>
      <Empty.Description>
        This campaign was made with a method that is no longer offered. What it
        sent is unchanged.
      </Empty.Description>
    </Empty.Header>
  </Empty>
);
