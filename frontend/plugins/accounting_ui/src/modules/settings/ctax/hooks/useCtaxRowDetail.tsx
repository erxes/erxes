import { toGraphqlView } from '@/utils/graphql';
import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { ctaxRowDetailAtom } from '../states/ctaxRowStates';
import { useQuery } from '@apollo/client';
import { GET_CTAX_VALUE } from '../graphql/queries/getCtaxs';

export const useCtaxRowDetail = () => {
  const [ctaxRowId, setCtaxRowId] = useQueryState<string>('ctax_row_id');
  const ctaxRowDetail = useAtomValue(ctaxRowDetailAtom);
  const { data: queryData, loading } = useQuery(GET_CTAX_VALUE, {
    variables: { id: ctaxRowId ?? '' },
    skip: !!ctaxRowDetail || !ctaxRowId,
  });
  const data = toGraphqlView(queryData);

  return {
    ctaxRowDetail:
      ctaxRowDetail && ctaxRowDetail?._id === ctaxRowId
        ? ctaxRowDetail
        : data?.ctaxRowDetail,
    loading,
    closeDetail: () => setCtaxRowId(null),
  };
};
