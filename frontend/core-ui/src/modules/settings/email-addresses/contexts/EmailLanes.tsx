import { useEmailLanes } from '@/settings/email-addresses/hooks/useEmailLanes';
import { TEmailLane } from '@/settings/email-addresses/types';
import { createContext, ReactNode, useContext } from 'react';

const EmailLanesContext = createContext<(email?: string) => TEmailLane>(
  () => 'unknown',
);

/**
 * Standings for a whole list, fetched once. A record table asks for every
 * address it is about to show rather than one query per row, so the lookup has
 * to live above the rows.
 */
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
