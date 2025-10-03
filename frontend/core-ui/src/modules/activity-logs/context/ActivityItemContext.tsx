import { createContext, useContext } from 'react';
import { IActivityLog } from '@/activity-logs/types/activityTypes';

export const ActivityItemContext = createContext<
  | (IActivityLog & {
      isLast: boolean;
      contentTypeModule: string | null;
      moduleName: string | null;
    })
  | null
>(null);

export const useActivityItemContext = () => {
  const context = useContext(ActivityItemContext);
  if (!context) {
    throw new Error(
      'useActivityItemContext must be used within an ActivityItemContext.Provider',
    );
  }
  return context || {};
};
