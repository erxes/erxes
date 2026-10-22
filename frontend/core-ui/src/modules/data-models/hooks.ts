import {
  useApolloClient,
  useMutation,
  useQuery,
  type MutationTuple,
} from '@apollo/client';
import { getOperationAST, type DocumentNode } from 'graphql';
import { toast } from 'erxes-ui';
import { dataModelErrorMessage } from './errorMessage';
import { DATA_MODEL_FIELDS } from './graphql';
import type { DataModel, DataModelRecord, ModelField } from './types';

export const useDataModelMutation = (
  document: DocumentNode,
  title: string,
): MutationTuple<
  Record<string, DataModel | DataModelRecord | ModelField>,
  Record<string, unknown>
> => {
  const client = useApolloClient();
  const name = getOperationAST(document)?.name?.value ?? '';
  const affected = name.startsWith('dataModelsUiRecord')
    ? [
        'dataModelsUiRecords',
        'dataModelsUiRecordDetail',
        'dataModelsUiReverseLinks',
        'customersRecordTable',
        'contactsCustomerDetailWithModelFields',
        'dataModelsUiRelationOptions',
        'dataModelsUiRelationReferences',
      ]
    : name.startsWith('dataModelsUiField')
    ? [
        'dataModelsUiFields',
        'dataModelsUiDetail',
        'dataModelsUiRelationOptions',
        'dataModelsUiRelationReferences',
      ]
    : [
        'dataModelsUiCatalog',
        'dataModelsUiDetail',
        'dataModelsUiRelationOptions',
        'dataModelsUiRelationReferences',
      ];
  return useMutation(document, {
    // A failed read after a committed write must not present the save as failed.
    // The observable query still exposes its own error and retry state.
    onQueryUpdated: (query) => query.refetch().catch(() => false),
    refetchQueries: () =>
      [...client.getObservableQueries().values()]
        .map((query) => query.queryName)
        .filter((queryName): queryName is string =>
          Boolean(queryName && affected.includes(queryName)),
        ),
    awaitRefetchQueries: true,
    onCompleted: () => toast({ title, variant: 'success' }),
    onError: (error) =>
      toast({
        title: 'Unable to save changes',
        description: dataModelErrorMessage(error),
        variant: 'destructive',
      }),
  });
};

export const useDataModelFields = (
  dataModelId: string,
  archived = false,
): {
  fields: ModelField[];
  loading: boolean;
  error: Error | undefined;
  refreshError?: Error;
  retry: () => void;
} => {
  const { data, loading, error, refetch } = useQuery<{
    dataModelFieldList: ModelField[];
  }>(DATA_MODEL_FIELDS, {
    variables: { dataModelId, archived },
    fetchPolicy: 'cache-and-network',
  });
  return {
    fields: data?.dataModelFieldList ?? [],
    loading: loading && !data,
    error: data ? undefined : error,
    refreshError: data ? error : undefined,
    retry: () => {
      void refetch().catch(() => undefined);
    },
  };
};
