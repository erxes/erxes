import { OperationVariables, useMutation } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { SEGMENT_REMOVE, SEGMENTS } from 'ui-modules';

export const useRemoveSegments = () => {
  const [segmentsRemove, { loading }] = useMutation(SEGMENT_REMOVE);

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

  return { removeSegments, loading };
};
