import { ComponentType, lazy } from 'react';

const BroadcastTabPreviewEmailContent = lazy(() =>
  import('../methods/BroadcastEmailTabContent').then((module) => ({
    default: module.BroadcastTabPreviewEmailContent,
  })),
);

const BroadcastTabPreviewMessengerContent = lazy(() =>
  import('../methods/BroadcastMessengerTabContent').then((module) => ({
    default: module.BroadcastTabPreviewMessengerContent,
  })),
);

const BroadcastTabPreviewNotificationContent = lazy(() =>
  import('../methods/BroadcastNotificationTabContent').then((module) => ({
    default: module.BroadcastTabPreviewNotificationContent,
  })),
);

const BROADCAST_TAB_PREVIEW_METHODS: Record<
  string,
  ComponentType<{ message: any }>
> = {
  email: BroadcastTabPreviewEmailContent,
  messenger: BroadcastTabPreviewMessengerContent,
  notification: BroadcastTabPreviewNotificationContent,
};

export const BroadcastTabPreviewContent = ({ message }: { message: any }) => {
  const { method } = message || {};

  const BroadcastMethodTabContent = BROADCAST_TAB_PREVIEW_METHODS[method];

  if (!BroadcastMethodTabContent) {
    return null;
  }

  return (
    <div className="w-full px-8 py-5 space-y-5">
      <BroadcastMethodTabContent message={message} />
    </div>
  );
};
