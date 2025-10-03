import { lazy } from 'react';

const WelcomeNotificationContent = lazy(() =>
  import('./WelcomeMessage').then((module) => ({
    default: module.WelcomeMessageContent,
  })),
);

export const NotificationContent = {
  welcome: WelcomeNotificationContent,
};
