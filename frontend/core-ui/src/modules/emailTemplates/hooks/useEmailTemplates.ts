import { useQuery } from '@apollo/client';
import { EMAIL_TEMPLATES } from '@/emailTemplates/graphql/queries';
import { IEmailTemplatesListResponse } from '@/emailTemplates/types';

type TUseEmailTemplatesParams = {
  page?: number;
  perPage?: number;
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

export const useEmailTemplates = (params: TUseEmailTemplatesParams = {}) => {
  const { data, loading, error, refetch } = useQuery<{
    emailTemplates: IEmailTemplatesListResponse;
  }>(EMAIL_TEMPLATES, {
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
    emailTemplates: data?.emailTemplates?.list || [],
    totalCount: data?.emailTemplates?.totalCount || 0,
    pageInfo: data?.emailTemplates?.pageInfo,
    loading,
    error,
    refetch,
  };
};
