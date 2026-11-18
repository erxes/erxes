import { useApolloClient } from '@apollo/client';
import { useState } from 'react';
import {
  REPORT_TRANSFER_ACCOUNTS,
  REPORT_TRANSFER_CATEGORIES,
  REPORT_TRANSFER_REPORTS,
} from '@/tunable-reports/graphql';
import {
  ReportTransfer,
  ReportTransferMaps,
  ReportTransferResult,
  reportToTransfer,
  transferToReport,
} from '@/tunable-reports/reportTransfer';
import { ReportValues } from '@/tunable-reports/schema';

// The report list resolver caps a page at 100 definitions.
const REPORT_PAGE = 100;
// Applying resolves arbitrary codes, so every visible account is indexed once.
const ALL_ACCOUNTS = 100000;

type Item = { _id: string; code?: string | null };
const index = (
  items: (Item | null | undefined)[] | null | undefined,
  byCode: boolean,
): Map<string, string> => {
  const map = new Map<string, string>();
  for (const item of items ?? [])
    if (item?.code)
      map.set(byCode ? item.code : item._id, byCode ? item._id : item.code);
  return map;
};

export const useReportTransfer = (): {
  loading: boolean;
  fill: (
    values: ReportValues,
    currentReportId?: string,
  ) => Promise<ReportTransferResult<ReportTransfer>>;
  apply: (
    transfer: ReportTransfer,
  ) => Promise<ReportTransferResult<ReportValues>>;
} => {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const loadMaps = async (
    byCode: boolean,
    accountIds?: string[],
  ): Promise<ReportTransferMaps> => {
    const [accounts, categories, reports] = await Promise.all([
      accountIds && !accountIds.length
        ? undefined
        : client.query({
            query: REPORT_TRANSFER_ACCOUNTS,
            variables: accountIds
              ? { ids: accountIds, perPage: accountIds.length }
              : { perPage: ALL_ACCOUNTS },
            fetchPolicy: 'network-only',
          }),
      client.query({
        query: REPORT_TRANSFER_CATEGORIES,
        fetchPolicy: 'network-only',
      }),
      client.query({
        query: REPORT_TRANSFER_REPORTS,
        variables: { perPage: REPORT_PAGE },
        fetchPolicy: 'network-only',
      }),
    ]);
    return {
      accounts: index(accounts?.data.accounts, byCode),
      categories: index(categories.data.accountCategories, byCode),
      reports: index(reports.data.accountingTunableReports.list, byCode),
    };
  };
  const run = async <T>(task: () => Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      return await task();
    } finally {
      setLoading(false);
    }
  };
  return {
    loading,
    fill: (values, currentReportId) =>
      run(async () => {
        const accountIds = new Set<string>();
        for (const section of values.sections)
          for (const formula of section.formulas)
            for (const id of [formula.debitAccountId, formula.creditAccountId])
              if (id) accountIds.add(id);
        const maps = await loadMaps(false, [...accountIds]);
        return reportToTransfer(values, maps, currentReportId);
      }),
    apply: (transfer) =>
      run(async () => transferToReport(transfer, await loadMaps(true))),
  };
};
