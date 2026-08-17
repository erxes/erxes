import { useAutomationHistoryDetail } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { GET_AUTOMATION_EXECUTION_DETAIL } from '@/automations/components/builder/history/graphql/automationExecutionQueries';
import { ApolloError, useQuery } from '@apollo/client';
import { createContext, useContext } from 'react';
import { IAutomationHistory } from 'ui-modules';

type TAutomationExecutionDetailContext = {
  executionDetail?: IAutomationHistory;
  loading: boolean;
  error?: ApolloError;
  refetch: () => void;
};

const AutomationExecutionDetailContext =
  createContext<TAutomationExecutionDetailContext | null>(null);

/**
 * Fetches the execution detail once and shares it with every consumer under
 * the history sheet (tabs, header), instead of each tab running the query.
 */
export const AutomationExecutionDetailProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { executionId } = useAutomationHistoryDetail();
  const { data, loading, error, refetch } = useQuery<{
    getAutomationExecutionDetail: IAutomationHistory;
  }>(GET_AUTOMATION_EXECUTION_DETAIL, {
    variables: { executionId },
  });

  return (
    <AutomationExecutionDetailContext.Provider
      value={{
        executionDetail: data?.getAutomationExecutionDetail,
        loading,
        error,
        refetch,
      }}
    >
      {children}
    </AutomationExecutionDetailContext.Provider>
  );
};

export const useAutomationExecutionDetail = () => {
  const context = useContext(AutomationExecutionDetailContext);
  if (!context) {
    throw new Error(
      'useAutomationExecutionDetail must be used within an AutomationExecutionDetailProvider',
    );
  }
  return context;
};
