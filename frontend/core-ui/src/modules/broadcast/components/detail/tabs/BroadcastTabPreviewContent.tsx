import { ComponentType, lazy, Suspense } from 'react';
import { TBroadcastMessage } from '../../../types';

const BroadcastTabPreviewEmailContent = lazy(() =>
  import('../../methods/BroadcastEmailTabContent').then((module) => ({
    default: module.BroadcastTabPreviewEmailContent,
  })),
);

const BroadcastTabPreviewMessengerContent = lazy(() =>
  import('../../methods/BroadcastMessengerTabContent').then((module) => ({
    default: module.BroadcastTabPreviewMessengerContent,
  })),
);

const BroadcastTabPreviewNotificationContent = lazy(() =>
  import('../../methods/BroadcastNotificationTabContent').then((module) => ({
    default: module.BroadcastTabPreviewNotificationContent,
  })),
);

const BroadcastTabPreviewWorkflowContent = lazy(() =>
  import('../../methods/BroadcastWorkflowTabContent').then((module) => ({
    default: module.BroadcastTabPreviewWorkflowContent,
  })),
);

const BROADCAST_TAB_PREVIEW_METHODS: Record<
  string,
  ComponentType<{ message: TBroadcastMessage }>
> = {
  email: BroadcastTabPreviewEmailContent,
  messenger: BroadcastTabPreviewMessengerContent,
  notification: BroadcastTabPreviewNotificationContent,
  workflow: BroadcastTabPreviewWorkflowContent,
};

export const BroadcastTabPreviewContent = ({
  message,
}: {
  message: TBroadcastMessage;
}) => {
  const BroadcastMethodTabContent = message.method
    ? BROADCAST_TAB_PREVIEW_METHODS[message.method]
    : undefined;

  if (!BroadcastMethodTabContent) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden px-8 py-5 space-y-5">
      <Suspense fallback={null}>
        <BroadcastMethodTabContent message={message} />
      </Suspense>
    </div>
  );
};
