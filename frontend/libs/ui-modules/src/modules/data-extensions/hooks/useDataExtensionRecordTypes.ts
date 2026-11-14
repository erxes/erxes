import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { DATA_EXTENSION_RECORD_TYPES } from '../graphql/queries';
import { IDataExtensionRecordType } from '../types';

export const useDataExtensionRecordTypes = () => {
  const { data, loading, error, refetch } = useQuery<{
    dataExtensionRecordTypes: IDataExtensionRecordType[];
  }>(DATA_EXTENSION_RECORD_TYPES, { fetchPolicy: 'cache-and-network' });

  return {
    recordTypes: data?.dataExtensionRecordTypes || [],
    loading,
    error,
    refetch,
  };
};

/** The record type chosen in the sidebar, falling back to the first one. */
export const useSelectedDataExtensionRecordType = () => {
  const [selected] = useQueryState<string>('recordType');
  const { recordTypes, loading, error, refetch } =
    useDataExtensionRecordTypes();

  const recordType =
    recordTypes.find((type) => type.recordType === selected) || recordTypes[0];

  return { recordType, recordTypes, loading, error, refetch };
};
