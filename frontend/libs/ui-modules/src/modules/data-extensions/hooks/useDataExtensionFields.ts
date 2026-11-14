import { useQuery } from '@apollo/client';
import { DATA_EXTENSION_FIELDS } from '../graphql/queries';
import { IDataExtensionField } from '../types';

/**
 * Active fields of one record type, or of every record type with
 * `all: true` (the data model map needs the whole picture).
 */
export const useDataExtensionFields = ({
  recordType,
  includeArchived = false,
  all = false,
}: {
  recordType?: string;
  includeArchived?: boolean;
  all?: boolean;
}) => {
  const { data, loading, error, refetch } = useQuery<{
    dataExtensionFields: IDataExtensionField[];
  }>(DATA_EXTENSION_FIELDS, {
    variables: { recordType: all ? undefined : recordType, includeArchived },
    skip: !all && !recordType,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  return {
    fields: data?.dataExtensionFields || [],
    loading,
    error,
    refetch,
  };
};
