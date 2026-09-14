import { useQueryState } from 'erxes-ui';
import { BroadcastEmailPreview } from './preview/BroadcastEmailPreview';
import { BroadcastMessengerPreview } from './preview/BroadcastMessengerPreview';
import { MessengerNotificationPreview } from './preview/MessengerNotificationPreview';
import { BroadcastWorkflowPreview } from './preview/BroadcastWorkflowPreview';

const BROADCAST_PREVIEW = {
  email: BroadcastEmailPreview,
  messenger: BroadcastMessengerPreview,
  notification: MessengerNotificationPreview,
  workflow: BroadcastWorkflowPreview,
};

type BROADCAST_PREVIEW_KEY = keyof typeof BROADCAST_PREVIEW;

export const BroadcastPreview = () => {
  const [method] = useQueryState('method');

  if (!method) {
    return <div>Method not found</div>;
  }

  const PreviewContent = BROADCAST_PREVIEW[method as BROADCAST_PREVIEW_KEY];

  // A method with no preview of its own must not render `undefined`, which
  // React reports as an invalid element type.
  if (!PreviewContent) {
    return <div>No preview for this broadcast type</div>;
  }

  return <PreviewContent />;
};
