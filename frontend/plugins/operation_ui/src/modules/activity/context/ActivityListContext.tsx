import { createContext, useContext } from 'react';
import { ITaskDetail } from '@/task/types';
import { IProject } from '@/project/types';
import { ITriageDetail } from '@/triage/types/triage';
export const ActivityListContext = createContext<
  ITaskDetail | IProject | ITriageDetail | null
>(null);

export const ActivityListProvider = ({
  contentDetail,
  children,
}: {
  contentDetail: ITaskDetail | IProject | ITriageDetail | null;
  children: React.ReactNode;
}) => {
  return (
    <ActivityListContext.Provider value={contentDetail}>
      {children}
    </ActivityListContext.Provider>
  );
};

export const useActivityListContext = () => {
  const context = useContext(ActivityListContext);
  if (!context) {
    throw new Error(
      'useActivityListContext must be used within an ActivityListContext.Provider',
    );
  }
  return context;
};
