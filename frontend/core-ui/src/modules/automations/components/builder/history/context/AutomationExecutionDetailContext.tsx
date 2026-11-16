import { IAutomationHistory } from 'ui-modules';
import { useAutomationHistoryDetail } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { GET_AUTOMATION_EXECUTION_DETAIL } from '@/automations/components/builder/history/graphql/automationExecutionQueries';
import { ApolloError, useQuery } from '@apollo/client';
import { createContext, useContext } from 'react';
// The version each step ran on, in the order of `actions`; null before any
// version was kept
type TExecutionDetail = IAutomationHistory & {
  actionVersions?: (number | null)[];
};

type TAutomationExecutionDetailContext = {
  executionDetail?: IAutomationHistory;
  actionVersions: (number | null)[];
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
  automationId,
}: {
  children: React.ReactNode;
  automationId?: string;
}) => {
  const { executionId, canGoBack } = useAutomationHistoryDetail();
  const { data, loading, error, refetch } = useQuery<{
    getAutomationExecutionDetail: TExecutionDetail;
  }>(GET_AUTOMATION_EXECUTION_DETAIL, {
    variables: {
      executionId,
    },
  });
  const executionDetail = data?.getAutomationExecutionDetail;
  // Workflow children can belong to another automation; only the selected
  // root execution must belong to the automation whose history is open.
  const wrongAutomation = Boolean(
    executionDetail &&
      !canGoBack &&
      automationId &&
      executionDetail.automationId !== automationId,
  );
  const selectionError = wrongAutomation
    ? new ApolloError({
        errorMessage: 'This execution does not belong to this automation.',
      })
    : error;
  const isShown = executionDetail?._id === executionId && !wrongAutomation;

  return (
    <AutomationExecutionDetailContext.Provider
      value={{
        executionDetail: isShown ? executionDetail : undefined,
        actionVersions: (isShown && executionDetail?.actionVersions) || [],
        loading,
        error: selectionError,
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
