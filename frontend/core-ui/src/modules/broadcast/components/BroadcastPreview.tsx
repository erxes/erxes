import { useQueryState } from 'erxes-ui';
import { BroadcastEmailPreview } from './preview/BroadcastEmailPreview';
import { BroadcastMessengerPreview } from './preview/BroadcastMessengerPreview';
import { MessengerNotificationPreview } from './preview/MessengerNotificationPreview';

const BROADCAST_PREVIEW = {
  email: BroadcastEmailPreview,
  messenger: BroadcastMessengerPreview,
  notification: MessengerNotificationPreview,
};

type BROADCAST_PREVIEW_KEY = keyof typeof BROADCAST_PREVIEW;

export const BroadcastPreview = () => {
  const [method] = useQueryState('method');

  if (!method) {
    return <div>Method not found</div>;
  }

  const PreviewContent = BROADCAST_PREVIEW[method as BROADCAST_PREVIEW_KEY];

  return <PreviewContent />;
};
