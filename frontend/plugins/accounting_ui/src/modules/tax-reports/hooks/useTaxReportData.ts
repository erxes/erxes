import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { TAX_REPORT_QUERY } from '../graphql/taxReportQueries';
import { isTaxReportKind } from '../types';
import { parseTaxReportRows } from '../utils/taxReportRows';

const OPTIONAL_FILTERS = ['branchId', 'departmentId', 'customerId'] as const;

export const useTaxReportData = () => {
  const [searchParams] = useSearchParams();
  const kind = searchParams.get('kind');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const filters = Object.fromEntries(
    OPTIONAL_FILTERS.flatMap((key) => {
      const value = searchParams.get(key);
      return value ? [[key, value]] : [];
    }),
  );
  const isValid = isTaxReportKind(kind) && !!fromDate && !!toDate;

  const { data, loading, error } = useQuery(TAX_REPORT_QUERY, {
    variables: {
      kind: kind || '',
      fromDate: fromDate ? new Date(fromDate) : new Date(),
      toDate: toDate ? new Date(toDate) : new Date(),
      ...filters,
    },
    skip: !isValid,
    fetchPolicy: 'network-only',
  });

  return {
    kind: isTaxReportKind(kind) ? kind : undefined,
    isValid,
    rows: parseTaxReportRows(data?.taxReportData),
    loading,
    error,
  };
};
