import { useAutomationExecutionDetail } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { IAutomationHistoryAction } from 'ui-modules';

type TAutomationExecutionSelectionContext = {
  selectedActionId: string | null;
  selectedAction?: IAutomationHistoryAction;
  selectAction: (actionId: string) => void;
  clearSelection: () => void;
};

const AutomationExecutionSelectionContext =
  createContext<TAutomationExecutionSelectionContext | null>(null);

export const AutomationExecutionSelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { executionDetail } = useAutomationExecutionDetail();
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const selectAction = useCallback(
    (actionId: string) => setSelectedActionId(actionId),
    [],
  );
  const clearSelection = useCallback(() => setSelectedActionId(null), []);

  const selectedAction = useMemo(
    () =>
      (executionDetail?.actions || []).find(
        ({ actionId }) => actionId === selectedActionId,
      ),
    [executionDetail?.actions, selectedActionId],
  );

  return (
    <AutomationExecutionSelectionContext.Provider
      value={{
        selectedActionId,
        selectedAction,
        selectAction,
        clearSelection,
      }}
    >
      {children}
    </AutomationExecutionSelectionContext.Provider>
  );
};

export const useAutomationExecutionSelection = () => {
  const context = useContext(AutomationExecutionSelectionContext);

  if (!context) {
    throw new Error(
      'useAutomationExecutionSelection must be used within an AutomationExecutionSelectionProvider',
    );
  }

  return context;
};
