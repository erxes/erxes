import type { Import, TransferRecordType } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';

/** Still working in the background: poll until it settles. */
const BUSY: Import['status'][] = ['parsing', 'checking', 'running'];

/** The columns a record type imports and exports. */
export const useTransferColumns = (recordType: TransferRecordType) =>
  useQuery(
    orpc.transfer.columns.queryOptions({
      input: { recordType },
      staleTime: 60_000,
      select: ({ data }) => data,
    }),
  );

export const importQuery = (id: string) =>
  orpc.transfer.import.queryOptions({
    input: { id },
    refetchInterval: (query) =>
      query.state.data && BUSY.includes(query.state.data.status) ? 1500 : false,
  });

export const useImports = () =>
  useQuery(
    orpc.transfer.imports.queryOptions({
      refetchInterval: (query) =>
        query.state.data?.data.some((item) => BUSY.includes(item.status)) ? 3000 : false,
    }),
  );

export const useExports = () =>
  useQuery(
    orpc.transfer.exports.queryOptions({
      refetchInterval: (query) =>
        query.state.data?.data.some((item) => item.status === 'running') ? 2000 : false,
    }),
  );

export const downloadHref = (fileId: string) => `/core/v1/files/${fileId}/download`;
