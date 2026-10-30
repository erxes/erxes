import { gql, useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IDataExtensionFilter, IDataExtensionRecordType } from '../types';
import {
  buildAggregateQuery,
  typedRequestOptions,
} from '../utils/typedOperations';

export interface IDataExtensionAggregateGroup {
  key: unknown;
  count: number;
  values: (number | null)[];
}

export interface IDataExtensionMetric {
  op: 'count' | 'sum' | 'avg' | 'min' | 'max';
  field?: string;
}

/** Counts and totals of a custom object, optionally per group, in one request. */
export const useDataExtensionAggregate = (
  recordType: IDataExtensionRecordType | undefined,
  params: {
    filter?: IDataExtensionFilter | null;
    groupBy?: string;
    metrics: IDataExtensionMetric[];
    skip?: boolean;
  },
) => {
  const client = useApolloClient();
  const [groups, setGroups] = useState<IDataExtensionAggregateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const key = JSON.stringify([
    params.filter || null,
    params.groupBy || null,
    params.metrics,
  ]);
  const skip = params.skip || !recordType?.custom;

  const refetch = useCallback(async () => {
    if (skip || !recordType) {
      return;
    }

    const current = ++generation.current;
    const [filter, groupBy, metrics] = JSON.parse(key);

    setLoading(true);

    try {
      const { data } = await client.query<{
        groups: IDataExtensionAggregateGroup[];
      }>({
        query: gql(buildAggregateQuery(recordType)),
        variables: { filter, groupBy, metrics },
        ...typedRequestOptions,
      });

      if (current === generation.current) {
        setGroups(data.groups);
      }
    } catch {
      if (current === generation.current) {
        setGroups([]);
      }
    } finally {
      if (current === generation.current) {
        setLoading(false);
      }
    }
  }, [client, recordType, key, skip]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { groups, loading, refetch };
};
