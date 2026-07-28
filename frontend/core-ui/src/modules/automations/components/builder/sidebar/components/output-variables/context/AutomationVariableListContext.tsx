import { createContext, useContext } from 'react';
import { TAutomationVariableDragPayload } from 'ui-modules';
import {
  TAutomationVariablePayloadBuilder,
  TAutomationVariableSourceNode,
} from '../AutomationVariableBrowserTypes';

export type TAutomationVariableListContext = {
  buildVariablePath: (path: string) => string;
  buildVariableToken: (path: string) => string;
  buildVariablePayload: TAutomationVariablePayloadBuilder;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
  sourceNode: TAutomationVariableSourceNode;
};

const AutomationVariableListContext =
  createContext<TAutomationVariableListContext | null>(null);

export const AutomationVariableListProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: TAutomationVariableListContext;
}) => {
  return (
    <AutomationVariableListContext.Provider value={value}>
      {children}
    </AutomationVariableListContext.Provider>
  );
};

export const useAutomationVariableList = () => {
  const context = useContext(AutomationVariableListContext);

  if (!context) {
    throw new Error(
      'useAutomationVariableList must be used within an AutomationVariableListProvider',
    );
  }

  return context;
};
