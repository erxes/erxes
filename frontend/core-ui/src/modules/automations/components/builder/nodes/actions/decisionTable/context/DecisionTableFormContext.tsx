import { TDecisionTableConfigFormApi } from '@/automations/components/builder/nodes/actions/decisionTable/hooks/useDecisionTableConfigForm';
import { createContext, ReactNode, useContext } from 'react';

const DecisionTableFormContext =
  createContext<TDecisionTableConfigFormApi | null>(null);

export const DecisionTableFormProvider = ({
  value,
  children,
}: {
  value: TDecisionTableConfigFormApi;
  children: ReactNode;
}) => (
  <DecisionTableFormContext.Provider value={value}>
    {children}
  </DecisionTableFormContext.Provider>
);

export const useDecisionTableFormContext = () => {
  const context = useContext(DecisionTableFormContext);

  if (!context) {
    throw new Error(
      'useDecisionTableFormContext must be used within DecisionTableFormProvider',
    );
  }

  return context;
};
