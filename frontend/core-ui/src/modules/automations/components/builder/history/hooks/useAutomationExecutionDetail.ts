import { useQuery } from '@apollo/client';
import { GET_AUTOMATION_EXECUTION_DETAIL } from '@/automations/components/builder/history/graphql/automationExecutionQueries';
import { useAutomationHistoryDetail } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { IAutomationHistory } from 'ui-modules';

type QueryResponse = {
  getAutomationExecutionDetail: IAutomationHistory;
};

export const useAutomationExecutionDetail = () => {
  const { executionId } = useAutomationHistoryDetail();
  const { data, loading, refetch } = useQuery<QueryResponse>(
    GET_AUTOMATION_EXECUTION_DETAIL,
    {
      variables: { executionId },
    },
  );
  return {
    executionDetail: data?.getAutomationExecutionDetail,
    loading,
    refetch,
  };
};
