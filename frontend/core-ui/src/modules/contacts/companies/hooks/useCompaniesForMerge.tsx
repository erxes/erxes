import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_COMPANIES_FOR_MERGE } from '@/contacts/companies/graphql/queries/getCompaniesForMerge';
import {
  MergeCompany,
  orderMergeCompanies,
} from '@/contacts/companies/utils/companyMerge';

interface CompaniesForMergeData {
  companies: { list: MergeCompany[] };
}

/** Loads the two selected companies once the merge sheet is open. */
export const useCompaniesForMerge = (companyIds: string[], open: boolean) => {
  const { data, loading } = useQuery<CompaniesForMergeData>(
    GET_COMPANIES_FOR_MERGE,
    {
      variables: { ids: companyIds, limit: companyIds.length },
      skip: !open || companyIds.length !== 2,
      fetchPolicy: 'network-only',
    },
  );

  const companies = useMemo(
    () => orderMergeCompanies(data?.companies?.list || [], companyIds),
    [data, companyIds],
  );

  return { companies, loading };
};
