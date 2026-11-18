import { useMutation, useQuery } from '@apollo/client';
import { IDataExtensionObject } from 'ui-modules';
import {
  DATA_EXTENSION_OBJECT_ADD,
  DATA_EXTENSION_OBJECT_ARCHIVE,
  DATA_EXTENSION_OBJECT_DELETE,
  DATA_EXTENSION_OBJECT_EDIT,
  DATA_EXTENSION_OBJECT_RESTORE,
  DATA_EXTENSION_OBJECTS,
} from '../graphql/objects';

// Objects are record types too, so the sidebar's list is refetched with them.
const refetchQueries = [
  'DataExtensionObjects',
  'DataExtensionRecordTypes',
  'DataExtensionFields',
];

export interface IDataExtensionObjectInput {
  key: string;
  singularLabel: string;
  pluralLabel: string;
  description?: string;
  icon?: string;
}

/** Every object, archived ones included, for the management screens. */
export const useDataExtensionObjects = () => {
  const { data, loading, error } = useQuery<{
    dataExtensionObjects: IDataExtensionObject[];
  }>(DATA_EXTENSION_OBJECTS, {
    variables: { includeArchived: true },
    fetchPolicy: 'cache-and-network',
  });

  return { objects: data?.dataExtensionObjects || [], loading, error };
};

export const useDataExtensionObjectMutations = () => {
  const options = { refetchQueries, awaitRefetchQueries: true };
  const [add, addState] = useMutation(DATA_EXTENSION_OBJECT_ADD, options);
  const [edit, editState] = useMutation(DATA_EXTENSION_OBJECT_EDIT, options);
  const [archive, archiveState] = useMutation(
    DATA_EXTENSION_OBJECT_ARCHIVE,
    options,
  );
  const [restore, restoreState] = useMutation(
    DATA_EXTENSION_OBJECT_RESTORE,
    options,
  );
  const [remove, removeState] = useMutation(
    DATA_EXTENSION_OBJECT_DELETE,
    options,
  );

  return {
    saving:
      addState.loading ||
      editState.loading ||
      archiveState.loading ||
      restoreState.loading ||
      removeState.loading,
    addObject: async (input: IDataExtensionObjectInput) =>
      (await add({ variables: { input } })).data
        ?.dataExtensionObjectAdd as IDataExtensionObject,
    editObject: (_id: string, input: Partial<IDataExtensionObjectInput>) =>
      edit({ variables: { _id, input } }),
    archiveObject: (_id: string) => archive({ variables: { _id } }),
    restoreObject: (_id: string) => restore({ variables: { _id } }),
    deleteObject: (_id: string) => remove({ variables: { _id } }),
  };
};
