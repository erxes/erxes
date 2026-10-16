import { QueryHookOptions, useQuery } from '@apollo/client/react';
import { GET_FORMS_TOTAL_COUNT } from '../graphql/formQueries';
import type {
  FormsTotalCountQuery,
  FormsTotalCountQueryVariables,
} from '~/gql/graphql';

export const useFormsTotalCount = (
  options?: QueryHookOptions<
    FormsTotalCountQuery,
    FormsTotalCountQueryVariables
  >,
) => {
  const { data, loading } = useQuery(GET_FORMS_TOTAL_COUNT, options);

  return {
    total: data?.formsTotalCount?.total ?? undefined,
    byChannel: data?.formsTotalCount?.byChannel,
    byTag: data?.formsTotalCount?.byTag,
    byStatus: data?.formsTotalCount?.byStatus,
    loading,
  };
};
