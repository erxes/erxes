import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  FIELD_GROUP_ARCHIVE,
  FIELD_GROUP_REMOVE,
  FIELD_GROUP_RESTORE,
  FIELD_RESTORE,
  FIELDS_ARCHIVE,
  FIELDS_REMOVE,
} from '../graphql/mutations/propertiesMutations';
import { FIELD_USAGE_QUERY } from '../graphql/queries/propertiesQueries';
import { TArchiveTarget } from '../states/archiveTargetState';

// Every list that shows or hides an archived field or group.
const REFETCH = [
  'FieldGroups',
  'Fields',
  'ArchivedFieldGroups',
  'ArchivedFields',
];

interface IFieldUsage {
  dependents: string[];
  hasValues: boolean | null;
  removable: boolean;
}

export const useFieldUsage = (
  target: TArchiveTarget | null,
  contentType: string,
) => {
  const { data, loading } = useQuery<{ fieldUsage: IFieldUsage }>(
    FIELD_USAGE_QUERY,
    {
      variables:
        target?.kind === 'group'
          ? { groupId: target.id, contentType }
          : { fieldIds: target?.ids ?? [], contentType },
      skip: !target,
      fetchPolicy: 'network-only',
    },
  );

  return { usage: data?.fieldUsage, loading };
};

const useToasts = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return {
    onError: (error: Error) =>
      toast({
        title: t('error', 'Error'),
        description: error.message,
        variant: 'destructive',
      }),
    success: (title: string) => toast({ title, variant: 'success' }),
    t,
  };
};

export const usePropertyArchive = () => {
  const { onError, success, t } = useToasts();
  const [archiveFields, { loading: fieldsLoading }] =
    useMutation(FIELDS_ARCHIVE);
  const [archiveGroup, { loading: groupLoading }] =
    useMutation(FIELD_GROUP_ARCHIVE);
  const [removeFields, { loading: removeFieldsLoading }] =
    useMutation(FIELDS_REMOVE);
  const [removeGroup, { loading: removeGroupLoading }] =
    useMutation(FIELD_GROUP_REMOVE);

  const archive = (target: TArchiveTarget, onDone: () => void) => {
    const options = {
      refetchQueries: REFETCH,
      onError,
      onCompleted: () => {
        success(t('archived', 'Archived'));
        onDone();
      },
    };

    if (target.kind === 'group') {
      archiveGroup({ ...options, variables: { id: target.id } });
    } else {
      archiveFields({ ...options, variables: { ids: target.ids } });
    }
  };

  // The server checks again; the dialog's answer may be stale by now.
  const remove = (target: TArchiveTarget, onDone: () => void) => {
    const options = {
      refetchQueries: REFETCH,
      onError,
      onCompleted: () => {
        success(t('deleted', 'Deleted'));
        onDone();
      },
    };

    if (target.kind === 'group') {
      removeGroup({ ...options, variables: { id: target.id } });
    } else {
      removeFields({ ...options, variables: { ids: target.ids } });
    }
  };

  return {
    archive,
    remove,
    loading:
      fieldsLoading ||
      groupLoading ||
      removeFieldsLoading ||
      removeGroupLoading,
  };
};

export const usePropertyRestore = () => {
  const { onError, success, t } = useToasts();
  const options = {
    refetchQueries: REFETCH,
    onError,
    onCompleted: () => success(t('restored', 'Restored')),
  };
  const [restoreField, { loading: fieldLoading }] = useMutation(
    FIELD_RESTORE,
    options,
  );
  const [restoreGroup, { loading: groupLoading }] = useMutation(
    FIELD_GROUP_RESTORE,
    options,
  );

  return {
    restoreField: (id: string) => restoreField({ variables: { id } }),
    restoreGroup: (id: string) => restoreGroup({ variables: { id } }),
    loading: fieldLoading || groupLoading,
  };
};
