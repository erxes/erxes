import { useQuery, QueryHookOptions } from '@apollo/client';
import { POS_LIST } from '~/modules/pos/graphql/queries/getPos';
import { IPos } from '@/pos/types/pos';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';

interface IGetPosQueryResponse {
  getPosList: IPos[];
}

export const useGetCurrentUsersPos = (
  options?: QueryHookOptions<IGetPosQueryResponse>,
) => {
  const currentUser = useAtomValue(currentUserState);
  const userId = currentUser?._id;
  const { data, loading } = useQuery<IGetPosQueryResponse>(POS_LIST, {
    ...options,
    variables: {
      userId,
      ...options?.variables,
    },
  });

  const pos = data?.getPosList;

  return { pos, loading };
};
