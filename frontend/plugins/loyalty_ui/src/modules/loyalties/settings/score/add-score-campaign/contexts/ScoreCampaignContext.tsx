import { createContext, ReactNode, useContext } from 'react';

// The saved campaign behind the form; empty while creating one.
const ScoreCampaignContext = createContext<{ campaignId?: string }>({});

export const ScoreCampaignProvider = ({
  campaignId,
  children,
}: {
  campaignId?: string;
  children: ReactNode;
}) => (
  <ScoreCampaignContext.Provider value={{ campaignId }}>
    {children}
  </ScoreCampaignContext.Provider>
);

export const useScoreCampaignContext = () => useContext(ScoreCampaignContext);
