import type { Import, TransferRecordType, TransferType } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { orpc } from '@erxes/core-contract/client';
import { usePluginText } from '~/modules/plugins/pluginText';

/** Still working in the background: poll until it settles. */
const BUSY: Import['status'][] = ['parsing', 'checking', 'running'];

/** The record types the member may import or export: core's, and installed plugins'. */
export const useTransferTypes = () =>
  useQuery(
    orpc.transfer.types.queryOptions({
      staleTime: 60_000,
      select: ({ data }) => data,
    }),
  );

/** The record type, if the member may import or export it. */
export const useTransferType = (recordType: TransferRecordType) =>
  useTransferTypes().data?.find((type) => type.recordType === recordType);

/** What a record type's records are called, in the member's language. */
export const useTransferLabel = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const pluginText = usePluginText();
  const types = useTransferTypes().data;

  return (recordType: TransferRecordType) => {
    const type: TransferType | undefined = types?.find((item) => item.recordType === recordType);

    if (type?.plugin) return pluginText(type.plugin, type.label);

    return t(`noun.${recordType}`, type?.label ?? recordType);
  };
};

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
