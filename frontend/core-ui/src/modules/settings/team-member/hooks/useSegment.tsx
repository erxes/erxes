import { OperationVariables, useQuery } from '@apollo/client';
import { queries } from '@/settings/team-member/graphql';

export type TSegment = {
  _id: string;
  name: string;
};

const useSegment = (options?: OperationVariables) => {
  const { data, loading } = useQuery(queries.GET_SEGMENTS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      contentTypes: ['core:user'],
    },
    onError(error) {
      console.error(error.message);
    },
  });

  const { segments } = data || [];

  return { segments, loading };
};

export { useSegment };
