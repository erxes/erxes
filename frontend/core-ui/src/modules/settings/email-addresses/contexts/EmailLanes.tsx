import { useEmailLanes } from '@/settings/email-addresses/hooks/useEmailLanes';
import { TEmailLane } from '@/settings/email-addresses/types';
import { createContext, ReactNode, useContext } from 'react';

const EmailLanesContext = createContext<(email?: string) => TEmailLane>(
  () => 'unknown',
);

export const EmailLanesProvider = ({
  emails,
  children,
}: {
  emails: string[];
  children: ReactNode;
}) => {
  const { laneOf } = useEmailLanes(emails);

  return (
    <EmailLanesContext.Provider value={laneOf}>
      {children}
    </EmailLanesContext.Provider>
  );
};

export const useEmailLane = () => useContext(EmailLanesContext);
