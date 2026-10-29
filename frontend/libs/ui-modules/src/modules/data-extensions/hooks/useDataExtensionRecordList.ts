import { gql, useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IDataExtensionField,
  IDataExtensionListRecord,
  IDataExtensionRecordType,
} from '../types';
import { buildListQuery, typedRequestOptions } from '../utils/typedOperations';
import { toDataExtensionRecordResult } from './useDataExtensionRecord';

export interface IDataExtensionListParams {
  searchValue?: string;
  limit?: number;
  skip?: number;
  sortField?: string;
  sortDirection?: 1 | -1;
}

type RawRecord = Record<string, unknown> & {
  _id: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * One page of a custom object's records from the typed endpoint. The whole
 * page, relation names included, comes back in a single request.
 */
export const useDataExtensionRecordList = (
  recordType: IDataExtensionRecordType | undefined,
  fields: IDataExtensionField[],
  recordTypes: IDataExtensionRecordType[],
  params: IDataExtensionListParams,
) => {
  const client = useApolloClient();
  const [records, setRecords] = useState<IDataExtensionListRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const generation = useRef(0);
  const { searchValue, limit, skip, sortField, sortDirection } = params;

  const refetch = useCallback(async () => {
    if (!recordType?.custom) {
      return;
    }

    const current = ++generation.current;

    setLoading(true);
    setError(null);

    try {
      const { data } = await client.query<{
        page: { totalCount: number; list: RawRecord[] };
      }>({
        query: gql(buildListQuery(recordType, fields, recordTypes)),
        variables: { searchValue, limit, skip, sortField, sortDirection },
        ...typedRequestOptions,
      });

      if (current !== generation.current) {
        return;
      }

      setTotalCount(data.page.totalCount);
      setRecords(
        data.page.list.map((raw) => {
          const result = toDataExtensionRecordResult(recordType, fields, raw);

          return {
            _id: raw._id,
            name: raw.name || '',
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            values: result.values,
            links: result.links,
          };
        }),
      );
    } catch (listError) {
      if (current === generation.current) {
        setError(
          listError instanceof Error ? listError : new Error(String(listError)),
        );
      }
    } finally {
      if (current === generation.current) {
        setLoading(false);
      }
    }
  }, [
    client,
    recordType,
    fields,
    recordTypes,
    searchValue,
    limit,
    skip,
    sortField,
    sortDirection,
  ]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { records, totalCount, loading, error, refetch };
};
