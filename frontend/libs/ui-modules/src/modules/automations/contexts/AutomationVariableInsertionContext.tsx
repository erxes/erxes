import { TAutomationVariableDragPayload } from '../utils/automationVariableDragUtils';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';

export type TAutomationVariableInsertionTarget = (
  payload: TAutomationVariableDragPayload,
) => void;

type TAutomationVariableInsertionContext = {
  clearInsertionTarget: (
    target: TAutomationVariableInsertionTarget,
  ) => void;
  insertVariable: TAutomationVariableInsertionTarget;
  registerInsertionTarget: (
    target: TAutomationVariableInsertionTarget,
  ) => void;
};

const AutomationVariableInsertionContext =
  createContext<TAutomationVariableInsertionContext | null>(null);

export const AutomationVariableInsertionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const insertionTargetRef =
    useRef<TAutomationVariableInsertionTarget | null>(null);

  const registerInsertionTarget = useCallback(
    (target: TAutomationVariableInsertionTarget) => {
      insertionTargetRef.current = target;
    },
    [],
  );

  const clearInsertionTarget = useCallback(
    (target: TAutomationVariableInsertionTarget) => {
      if (insertionTargetRef.current === target) {
        insertionTargetRef.current = null;
      }
    },
    [],
  );

  const insertVariable = useCallback(
    (payload: TAutomationVariableDragPayload) => {
      insertionTargetRef.current?.(payload);
    },
    [],
  );

  const value = useMemo(
    () => ({
      clearInsertionTarget,
      insertVariable,
      registerInsertionTarget,
    }),
    [clearInsertionTarget, insertVariable, registerInsertionTarget],
  );

  return (
    <AutomationVariableInsertionContext.Provider value={value}>
      {children}
    </AutomationVariableInsertionContext.Provider>
  );
};

export const useAutomationVariableInsertion = () => {
  const context = useContext(AutomationVariableInsertionContext);

  if (!context) {
    throw new Error(
      'useAutomationVariableInsertion must be used within an AutomationVariableInsertionProvider',
    );
  }

  return context;
};

export const useOptionalAutomationVariableInsertion = () =>
  useContext(AutomationVariableInsertionContext);
