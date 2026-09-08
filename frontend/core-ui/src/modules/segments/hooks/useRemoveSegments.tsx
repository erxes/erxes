import {
  OperationVariables,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import {
  ISegmentUsage,
  SEGMENT_REMOVE,
  SEGMENT_USAGE,
  SEGMENTS,
} from 'ui-modules';

export const useRemoveSegments = () => {
  const client = useApolloClient();
  const [segmentsRemove, { loading }] = useMutation(SEGMENT_REMOVE);

  const readUsage = async (segmentIds: string[]): Promise<ISegmentUsage[]> => {
    const { data } = await client.query({
      query: SEGMENT_USAGE,
      variables: { ids: segmentIds },
      fetchPolicy: 'network-only',
    });

    return data?.segmentUsage || [];
  };

  const removeSegments = async (
    segmentIds: string[],
    options?: OperationVariables,
  ) => {
    await segmentsRemove({
      ...options,
      variables: { ids: segmentIds, ...options?.variables },
      refetchQueries: [SEGMENTS],
    });
  };

  return { removeSegments, readUsage, loading };
};
