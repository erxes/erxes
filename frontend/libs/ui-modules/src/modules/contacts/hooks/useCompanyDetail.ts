import {
  COMPANY_DETAIL,
  COMPANY_INLINE,
} from '../graphql/queries/companyDetailQueries';
import { QueryHookOptions, useQuery } from '@apollo/client';

import { ICompany } from '../types';

export const useCompanyDetail = (
  options: QueryHookOptions<{ companyDetail: ICompany }>,
  inline?: boolean,
) => {
  const { data, loading, error } = useQuery<{
    companyDetail: ICompany;
  }>(inline ? COMPANY_INLINE : COMPANY_DETAIL, options);

  return {
    loading,
    companyDetail: data?.companyDetail,
    error,
  };
};
