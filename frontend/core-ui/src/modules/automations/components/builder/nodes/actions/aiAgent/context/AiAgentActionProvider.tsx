import { createContext, ReactNode, useContext } from 'react';

const AiAgentActionContext = createContext<{ actionId: string } | null>(null);

export const AiAgentActionProvider = ({
  actionId,
  children,
}: {
  actionId: string;
  children: ReactNode;
}) => (
  <AiAgentActionContext.Provider value={{ actionId }}>
    {children}
  </AiAgentActionContext.Provider>
);

export const useAiAgentActionContext = () => {
  const context = useContext(AiAgentActionContext);

  if (!context) {
    throw new Error(
      'useAiAgentActionContext must be used within AiAgentActionProvider',
    );
  }

  return context;
};
