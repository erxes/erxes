import { lazy } from 'react';

export const SystemNotificationContents = {
  'core:welcome': lazy(() =>
    import('./WelcomeMessage').then((module) => ({
      default: module.WelcomeMessageContent,
    })),
  ),
};
