import { createContext, useContext } from 'react';
import { ITask } from '@/task/types';
import { IProject } from '@/project/types';
import { ITriage } from '@/triage/types/triage';
export const ActivityListContext = createContext<
  ITask | IProject | ITriage | null
>(null);

export const ActivityListProvider = ({
  contentDetail,
  children,
}: {
  contentDetail: ITask | IProject | ITriage | null;
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
