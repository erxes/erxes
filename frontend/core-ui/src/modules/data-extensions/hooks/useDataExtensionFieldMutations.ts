import { useMutation } from '@apollo/client';
import {
  DATA_EXTENSION_RELATION_ADD,
  DATA_EXTENSION_FIELD_ADD,
  DATA_EXTENSION_FIELD_ARCHIVE,
  DATA_EXTENSION_FIELD_DELETE,
  DATA_EXTENSION_FIELD_EDIT,
  DATA_EXTENSION_FIELD_RESTORE,
} from '../graphql/mutations';
import {
  DataExtensionFieldType,
  DataExtensionRelationCreateKind,
  IDataExtensionField,
  IDataExtensionFieldOption,
  IDataExtensionFieldSettings,
} from 'ui-modules';

// Field lists and per-type counts change together, so both are refetched.
const refetchQueries = ['DataExtensionFields', 'DataExtensionRecordTypes'];

export interface IDataExtensionFieldAddInput {
  recordType: string;
  key: string;
  label: string;
  description?: string;
  type: DataExtensionFieldType;
  options?: IDataExtensionFieldOption[];
  settings?: IDataExtensionFieldSettings;
  order?: number;
}

export interface IDataExtensionRelationAddInput {
  recordType: string;
  key: string;
  label: string;
  description?: string;
  targetRecordType: string;
  kind: DataExtensionRelationCreateKind;
  inverseKey: string;
  inverseLabel: string;
}

export type IDataExtensionFieldEditInput = Partial<
  Pick<
    IDataExtensionFieldAddInput,
    'label' | 'description' | 'options' | 'order' | 'settings'
  >
>;

export const useDataExtensionFieldMutations = () => {
  const [add, addState] = useMutation<
    { dataExtensionFieldAdd: IDataExtensionField },
    { input: IDataExtensionFieldAddInput }
  >(DATA_EXTENSION_FIELD_ADD, { refetchQueries, awaitRefetchQueries: true });

  const [addRelation, addRelationState] = useMutation<
    { dataExtensionRelationAdd: IDataExtensionField[] },
    { input: IDataExtensionRelationAddInput }
  >(DATA_EXTENSION_RELATION_ADD, { refetchQueries, awaitRefetchQueries: true });

  const [edit, editState] = useMutation<
    { dataExtensionFieldEdit: IDataExtensionField },
    { _id: string; input: IDataExtensionFieldEditInput }
  >(DATA_EXTENSION_FIELD_EDIT, { refetchQueries, awaitRefetchQueries: true });

  const [archive, archiveState] = useMutation<
    { dataExtensionFieldArchive: IDataExtensionField },
    { _id: string }
  >(DATA_EXTENSION_FIELD_ARCHIVE, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  const [restore, restoreState] = useMutation<
    { dataExtensionFieldRestore: IDataExtensionField },
    { _id: string }
  >(DATA_EXTENSION_FIELD_RESTORE, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  const [remove, removeState] = useMutation<
    { dataExtensionFieldDelete: string[] },
    { _id: string }
  >(DATA_EXTENSION_FIELD_DELETE, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  return {
    addField: (input: IDataExtensionFieldAddInput) =>
      add({ variables: { input } }),
    addRelation: (input: IDataExtensionRelationAddInput) =>
      addRelation({ variables: { input } }),
    editField: (_id: string, input: IDataExtensionFieldEditInput) =>
      edit({ variables: { _id, input } }),
    archiveField: (_id: string) => archive({ variables: { _id } }),
    restoreField: (_id: string) => restore({ variables: { _id } }),
    deleteField: (_id: string) => remove({ variables: { _id } }),
    saving: addState.loading || editState.loading || addRelationState.loading,
    changingStatus:
      archiveState.loading || restoreState.loading || removeState.loading,
  };
};
