import { createContext, useContext } from 'react';
import { ITicket } from '@/ticket/types';
export const ActivityListContext = createContext<ITicket | null>(null);

export const ActivityListProvider = ({
  contentDetail,
  children,
}: {
  contentDetail: ITicket | null;
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
