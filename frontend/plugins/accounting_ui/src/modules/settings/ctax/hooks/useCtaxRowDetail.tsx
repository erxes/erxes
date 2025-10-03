import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { ctaxRowDetailAtom } from '../states/ctaxRowStates';
import { useQuery } from '@apollo/client';
import { GET_CTAX_VALUE } from '../graphql/queries/getCtaxs';

export const useCtaxRowDetail = () => {
  const [ctaxRowId, setCtaxRowId] =
    useQueryState<string>('ctax_row_id');
  const ctaxRowDetail = useAtomValue(ctaxRowDetailAtom);
  const { data, loading } = useQuery(GET_CTAX_VALUE, {
    variables: { id: ctaxRowId },
    skip: !!ctaxRowDetail || !ctaxRowId,
  });

  return {
    ctaxRowDetail:
      ctaxRowDetail && ctaxRowDetail?._id === ctaxRowId
        ? ctaxRowDetail
        : data?.ctaxRowDetail,
    loading,
    closeDetail: () => setCtaxRowId(null),
  };
};
