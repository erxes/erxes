import { QueryHookOptions, useQuery } from '@apollo/client/react';
import { GET_FORMS_TOTAL_COUNT } from '../graphql/formQueries';

export const useFormsTotalCount = (options?: QueryHookOptions) => {
  const { data, loading } = useQuery(GET_FORMS_TOTAL_COUNT, options);

  return {
    total: data?.formsTotalCount?.total,
    byChannel: data?.formsTotalCount?.byChannel,
    byTag: data?.formsTotalCount?.byTag,
    byStatus: data?.formsTotalCount?.byStatus,
    loading,
  };
};
