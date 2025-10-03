import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { vatRowDetailAtom } from '../states/vatRowStates';
import { useQuery } from '@apollo/client';
import { GET_VAT_VALUE } from '../graphql/queries/getVats';

export const useVatRowDetail = () => {
  const [vatRowId, setVatRowId] =
    useQueryState<string>('vat_row_id');
  const vatRowDetail = useAtomValue(vatRowDetailAtom);
  const { data, loading } = useQuery(GET_VAT_VALUE, {
    variables: { id: vatRowId },
    skip: !!vatRowDetail || !vatRowId,
  });

  return {
    vatRowDetail:
      vatRowDetail && vatRowDetail?._id === vatRowId
        ? vatRowDetail
        : data?.vatRowDetail,
    loading,
    closeDetail: () => setVatRowId(null),
  };
};
