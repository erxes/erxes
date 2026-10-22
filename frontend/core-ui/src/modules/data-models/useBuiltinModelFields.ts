import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { usePermissionCheck } from 'ui-modules';
import { DATA_MODEL_FIELDS } from './graphql';
import {
  withBuiltinModelFields,
  type BuiltinModelName,
} from './builtinDocuments';
import type { DocumentNode } from 'graphql';
import type { ModelField } from './types';

const EMPTY_FIELDS: ModelField[] = [];
export const useBuiltinModelFields = (
  model: BuiltinModelName,
): {
  fields: ModelField[];
  loading: boolean;
  error: Error | undefined;
  retry: () => void;
} => {
  const { hasActionPermission } = usePermissionCheck();
  const enabled =
    hasActionPermission('dataModelsRead') &&
    hasActionPermission('dataModelRecordsRead');
  const { data, loading, error, refetch } = useQuery<{
    dataModelFieldList: ModelField[];
  }>(DATA_MODEL_FIELDS, {
    variables: { dataModelId: `core:${model}`, archived: false },
    skip: !enabled,
    fetchPolicy: 'cache-and-network',
  });
  return {
    fields: enabled ? data?.dataModelFieldList ?? EMPTY_FIELDS : EMPTY_FIELDS,
    loading: enabled && loading,
    error: enabled ? error : undefined,
    retry: () => {
      void refetch().catch(() => undefined);
    },
  };
};

export const useBuiltinModelDocument = (
  document: DocumentNode,
  model: BuiltinModelName,
  paths: readonly (readonly string[])[],
): {
  document: DocumentNode;
  fields: ModelField[];
  loading: boolean;
  error: Error | undefined;
  retry: () => void;
} => {
  const metadata = useBuiltinModelFields(model);
  const generated = useMemo(
    () => withBuiltinModelFields(document, model, metadata.fields, paths),
    [document, model, metadata.fields, paths],
  );
  return { ...metadata, document: generated };
};
