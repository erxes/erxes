import { useQuery, QueryHookOptions } from '@apollo/client';
import { POS_LIST } from '~/modules/pos/graphql/queries/getPos';

import { IPos } from '~/modules/pos/types/pos';

interface IGetPosQueryResponse {
  posList: IPos[];
}

export const useGetPos = (options?: QueryHookOptions<IGetPosQueryResponse>) => {
  const { data, loading } = useQuery<IGetPosQueryResponse>(POS_LIST, options);

  const pos = data?.posList;

  return { pos, loading };
};
