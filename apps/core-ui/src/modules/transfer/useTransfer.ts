import type { Import, TransferRecordType } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api';

export const IMPORTS_KEY = ['imports'];
export const EXPORTS_KEY = ['exports'];

/** Still working in the background: poll until it settles. */
export const BUSY: Import['status'][] = ['parsing', 'checking', 'running'];

export const useTransferColumns = (recordType: TransferRecordType) =>
  useQuery({
    queryKey: ['transfer', 'columns', recordType],
    queryFn: () => api.transfer.columns({ recordType }),
    staleTime: 60_000,
  }).data?.data ?? [];

export const useImport = (id: string) =>
  useQuery({
    queryKey: [...IMPORTS_KEY, id],
    queryFn: () => api.transfer.import({ id }),
    refetchInterval: (query) =>
      query.state.data && BUSY.includes(query.state.data.status) ? 1500 : false,
  });

export const useImports = () =>
  useQuery({
    queryKey: IMPORTS_KEY,
    queryFn: () => api.transfer.imports(),
    refetchInterval: (query) =>
      query.state.data?.data.some((item) => BUSY.includes(item.status)) ? 3000 : false,
  });

export const useExports = (enabled = true) =>
  useQuery({
    queryKey: EXPORTS_KEY,
    queryFn: () => api.transfer.exports(),
    enabled,
    refetchInterval: (query) =>
      query.state.data?.data.some((item) => item.status === 'running') ? 2000 : false,
  });

export const downloadHref = (fileId: string) => `/core/v1/files/${fileId}/download`;

export const RECORD_PATHS: Record<TransferRecordType, string> = {
  customer: '/contacts/customers',
  lead: '/contacts/leads',
  company: '/contacts/companies',
};
