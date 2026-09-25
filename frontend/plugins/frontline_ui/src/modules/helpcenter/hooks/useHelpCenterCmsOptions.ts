import { useQuery } from '@apollo/client';
import { GET_HELP_CENTER_CMS_OPTIONS } from '@/helpcenter/graphql/queries/getHelpCenterCmsOptions';
import { IHelpCenterCmsOption } from '@/helpcenter/types';

export const useHelpCenterCmsOptions = () => {
  const { data, loading, error } = useQuery<{
    contentCMSList: IHelpCenterCmsOption[] | null;
  }>(GET_HELP_CENTER_CMS_OPTIONS, { fetchPolicy: 'cache-and-network' });

  const unavailable = !!error?.graphQLErrors.some(
    ({ extensions }) => extensions?.code === 'GRAPHQL_VALIDATION_FAILED',
  );

  return {
    cmsList: data?.contentCMSList ?? [],
    loading,
    error: unavailable ? undefined : error,
    unavailable,
  };
};
