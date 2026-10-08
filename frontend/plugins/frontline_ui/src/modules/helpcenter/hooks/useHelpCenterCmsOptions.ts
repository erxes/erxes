import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { GET_HELP_CENTER_CMS_OPTIONS } from '@/helpcenter/graphql/queries/getHelpCenterCmsOptions';

export const useHelpCenterCmsOptions = () => {
  const { data, loading, error } = useQuery(GET_HELP_CENTER_CMS_OPTIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const unavailable = !!error?.graphQLErrors.some(
    ({ extensions }) => extensions?.code === 'GRAPHQL_VALIDATION_FAILED',
  );

  return {
    cmsList: data?.contentCMSList?.filter(isDefined) ?? [],
    loading,
    error: unavailable ? undefined : error,
    unavailable,
  };
};
