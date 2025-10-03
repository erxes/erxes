import { QueryHookOptions, useQuery } from '@apollo/client';
import { COMPANY_INLINE } from '../graphql/queries/getInlineCompany';
import { ICompany } from '../types';

export const useCompanyInline = (
  options: QueryHookOptions<{ companyDetail: ICompany }, { _id: string }>,
) => {
  const { data, loading } = useQuery<
    { companyDetail: ICompany },
    { _id: string }
  >(COMPANY_INLINE, options);

  return {
    loading,
    companyDetail: data?.companyDetail,
  };
};
