import { gql, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { IDataExtensionRecordType } from '../types';
import {
  buildNamesQuery,
  describeLinkedRecord,
  typedRequestOptions,
} from '../utils/typedOperations';

const SKIPPED = gql`
  query DataExtensionsRecordNameSkipped {
    __typename
  }
`;

/** The display name of one record, read from the tenant endpoint. */
export const useDataExtensionRecordName = (
  recordType: IDataExtensionRecordType | undefined,
  id: string,
) => {
  const query = useMemo(
    () => (recordType ? gql(buildNamesQuery(recordType)) : SKIPPED),
    [recordType],
  );
  const { data, loading } = useQuery<{
    records: Record<string, unknown>[];
  }>(query, {
    ...typedRequestOptions,
    variables: { _ids: [id] },
    skip: !recordType || !id,
  });
  const record = data?.records?.[0];

  return { name: record ? describeLinkedRecord(record) : undefined, loading };
};
