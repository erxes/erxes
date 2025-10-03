import { OperationVariables, useQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useQueryState } from 'erxes-ui';
import { renderingPosDetailAtom } from '@/pos/states/posDetail';
import { queries } from '@/pos/graphql';

export const usePosDetail = (operationVariables?: OperationVariables) => {
  const [_id] = useQueryState('pos_id');
  const setRendering = useSetAtom(renderingPosDetailAtom);

  const { data, loading, error } = useQuery(queries.posDetail, {
    variables: { _id },
    skip: !_id,
    ...operationVariables,
    onCompleted: (data) => {
      setRendering(false);
      operationVariables?.onCompleted?.(data);
    },
    onError: (error) => {
      setRendering(false);
      operationVariables?.onError?.(error);
    },
  });

  return {
    posDetail: data?.posDetail ?? null,
    loading,
    error,
  };
};
