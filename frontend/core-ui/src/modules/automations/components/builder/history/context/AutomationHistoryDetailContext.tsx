import { createContext, useCallback, useContext, useState } from 'react';

// Holds the execution the history sheet is showing. Workflow child
// executions drill down IN PLACE (with a back stack) instead of stacking
// another modal sheet — nested modals fight over focus/pointer locks.
const AutomationHistoryDetailContext = createContext<{
  executionId: string;
  canGoBack: boolean;
  openChildExecution: (childExecutionId: string) => void;
  backToParentExecution: () => void;
} | null>(null);

export const AutomationHistoryDetailProvider = ({
  children,
  executionId,
}: {
  children: React.ReactNode;
  executionId: string;
}) => {
  const [executionIdStack, setExecutionIdStack] = useState<string[]>([]);

  const openChildExecution = useCallback((childExecutionId: string) => {
    setExecutionIdStack((stack) => [...stack, childExecutionId]);
  }, []);

  const backToParentExecution = useCallback(() => {
    setExecutionIdStack((stack) => stack.slice(0, -1));
  }, []);

  return (
    <AutomationHistoryDetailContext.Provider
      value={{
        executionId: executionIdStack.at(-1) ?? executionId,
        canGoBack: executionIdStack.length > 0,
        openChildExecution,
        backToParentExecution,
      }}
    >
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
