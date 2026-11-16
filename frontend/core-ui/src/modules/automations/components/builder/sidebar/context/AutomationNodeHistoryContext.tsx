import { useAutomationNodeHistory } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeHistory';
import { createContext, ReactNode, useContext } from 'react';

type TAutomationNodeHistoryContext = ReturnType<
  typeof useAutomationNodeHistory
>;

const AutomationNodeHistoryContext =
  createContext<TAutomationNodeHistoryContext | null>(null);

/** One history state for the panel: the list and the opened version share it. */
export const AutomationNodeHistoryProvider = ({
  children,
}: {
  children: ReactNode;
}) => (
  <AutomationNodeHistoryContext.Provider value={useAutomationNodeHistory()}>
    {children}
  </AutomationNodeHistoryContext.Provider>
);

export const useAutomationNodeHistoryContext = () => {
  const context = useContext(AutomationNodeHistoryContext);

  if (!context) {
    throw new Error(
      'useAutomationNodeHistoryContext must be used within AutomationNodeHistoryProvider',
    );
  }

  return context;
};
