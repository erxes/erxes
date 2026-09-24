import { AUTOMATION_DETAIL } from '@/automations/graphql/automationQueries';
import { IAutomation } from '@/automations/types';
import { useQuery } from '@apollo/client';

export const useAutomationDetail = (id?: string) => {
  const { data, loading, error } = useQuery<{ automationDetail: IAutomation }>(
    AUTOMATION_DETAIL,
    { variables: { id }, skip: !id },
  );

  return { automation: data?.automationDetail, loading, error };
};
