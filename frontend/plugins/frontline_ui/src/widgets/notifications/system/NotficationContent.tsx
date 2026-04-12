import { lazy } from 'react';

const WelcomeNotificationContent = lazy(() =>
  import('./WelcomeMessage').then((module) => ({
    default: module.WelcomeMessageContent,
  })),
);

const FacebookBotHealthNotificationContent = lazy(() =>
  import('./FacebookBotHealthNotification').then((module) => ({
    default: module.FacebookBotHealthNotificationContent,
  })),
);

export const NotificationContent = {
  welcome: WelcomeNotificationContent,
  facebookBotHealth: FacebookBotHealthNotificationContent,
};
