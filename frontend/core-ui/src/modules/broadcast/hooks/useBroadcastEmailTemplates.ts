import { useQuery } from '@apollo/client';
import { BROADCAST_EMAIL_TEMPLATES } from '../graphql/queries';

export const useBroadcastEmailTemplates = (searchValue?: string) => {
  const { data, loading } = useQuery(BROADCAST_EMAIL_TEMPLATES, {
    variables: { searchValue },
  });

  return {
    templates: data?.broadcastEmailTemplates?.list || [],
    loading,
  };
};
