import { AUTOMATION_DETAIL } from '@/automations/graphql/automationQueries';
import { IAutomation } from '@/automations/types';
import { useQuery } from '@apollo/client';

export const useAutomationWorkflowActionMapper = (id?: string) => {
  const { data, loading } = useQuery<{ automationDetail: IAutomation }>(
    AUTOMATION_DETAIL,
    {
      variables: { id },
      skip: !id,
    },
  );

  return {
    detail: data?.automationDetail,
    loading,
  };
};
