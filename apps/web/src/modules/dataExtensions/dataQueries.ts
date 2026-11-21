import type { DataExtensionFieldType } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { FIELD_TYPES } from './fieldTypes';

/** The definitions change only when someone shapes the data model. */
const STALE = 60_000;

/** The organisation's custom objects, by label; the archived ones with `archived`. */
export const objectsQuery = (archived = false) =>
  orpc.dataObjects.list.queryOptions({ input: { archived }, staleTime: STALE });

/** A record type's fields in order; the archived ones with `archived`. */
export const fieldsQuery = (recordType: string | null, archived = false) =>
  orpc.dataFields.list.queryOptions({
    input: recordType ? { recordType, archived } : skipToken,
    staleTime: STALE,
  });

/** The record types fields go on: core's, the plugins' and the custom objects. */
export const recordTypesQuery = () => orpc.recordTypes.list.queryOptions({ staleTime: STALE });

/** A record type's active fields; empty while they load. */
export const useFields = (recordType: string | null) => {
  const query = useQuery(fieldsQuery(recordType));

  return { ...query, fields: query.data?.data ?? [] };
};

/** One record type by its type, with its own fields (for formulas). */
export const useRecordType = (type: string | null) => {
  const query = useQuery(recordTypesQuery());

  return query.data?.data.find((entry) => entry.type === type);
};

/** Whether the member may change objects and fields (`properties.manage`). */
export const useCanManageDataModel = () => useCan()('properties.manage');

/** Refetches what a data model change touches: objects, fields and record types. */
export const useRefreshDataModel = () => {
  const client = useQueryClient();

  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: orpc.dataObjects.key() }),
      client.invalidateQueries({ queryKey: orpc.dataFields.key() }),
      client.invalidateQueries({ queryKey: orpc.recordTypes.key() }),
      client.invalidateQueries({ queryKey: orpc.dataPlugins.key() }),
    ]);
};

/** A field type's name in the member's language. */
export const useTypeLabel = () => {
  const { t } = useTranslation('data', { keyPrefix: 'types' });

  return (type: DataExtensionFieldType) => t(type, FIELD_TYPES[type].label);
};
