import { OperationVariables, useQuery } from '@apollo/client';
import { GET_VAT_VALUE } from '../graphql/queries/getVats';
import { IVatRow } from '../types/VatRow';

export const useVatValue = (options?: OperationVariables) => {
  const { data, loading } = useQuery<{ vatRowDetail: IVatRow }>(GET_VAT_VALUE, {
    ...options,
  });

  return {
    vatRowDetail: data?.vatRowDetail,
    loading,
  };
};
