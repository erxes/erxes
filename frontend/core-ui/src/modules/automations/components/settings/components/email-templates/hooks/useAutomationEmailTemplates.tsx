import { useQuery } from '@apollo/client';
import { AUTOMATION_EMAIL_TEMPLATES } from '@/automations/components/settings/components/email-templates/graphql/queries';
import { IAutomationEmailTemplatesListResponse } from '@/automations/components/settings/components/email-templates/types/automationEmailTemplates';

interface UseAutomationEmailTemplatesParams {
  page?: number;
  perPage?: number;
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
}

export function useAutomationEmailTemplates(
  params: UseAutomationEmailTemplatesParams = {},
) {
  const { data, loading, error, refetch } = useQuery<{
    automationEmailTemplates: IAutomationEmailTemplatesListResponse;
  }>(AUTOMATION_EMAIL_TEMPLATES, {
    variables: {
      page: params.page || 1,
      perPage: params.perPage || 20,
      searchValue: params.searchValue || '',
      sortField: params.sortField || 'createdAt',
      sortDirection: params.sortDirection || -1,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    emailTemplates: data?.automationEmailTemplates?.list || [],
    totalCount: data?.automationEmailTemplates?.totalCount || 0,
    pageInfo: data?.automationEmailTemplates?.pageInfo,
    loading,
    error,
    refetch,
  };
}
