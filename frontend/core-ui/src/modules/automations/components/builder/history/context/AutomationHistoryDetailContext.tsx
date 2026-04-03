import { createContext, useContext } from 'react';

const AutomationHistoryDetailContext = createContext<{
  executionId: string;
} | null>(null);

export const AutomationHistoryDetailProvider = ({
  children,
  executionId,
}: {
  children: React.ReactNode;
  executionId: string;
}) => {
  return (
    <AutomationHistoryDetailContext.Provider value={{ executionId }}>
      {children}
    </AutomationHistoryDetailContext.Provider>
  );
};

export const useAutomationHistoryDetail = () => {
  const context = useContext(AutomationHistoryDetailContext);
  if (!context) {
    throw new Error(
      'useAutomationHistoryDetail must be used within a AutomationHistoryDetailProvider',
    );
  }
  return context;
};
