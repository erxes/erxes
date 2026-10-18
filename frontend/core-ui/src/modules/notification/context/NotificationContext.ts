import { createContext, useContext } from 'react';
import type { UseNotificationResult } from '@/notification/types/myInbox';

export const NotificationContext = createContext<UseNotificationResult | null>(
  null,
);

export const useNotificationContext = (): UseNotificationResult => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationContext must be used within NotificationContext.Provider',
    );
  }
  return context;
};
