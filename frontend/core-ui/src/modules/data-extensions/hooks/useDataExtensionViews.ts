import { useMutation, useQuery } from '@apollo/client';
import { IDataExtensionView } from 'ui-modules';
import {
  DATA_EXTENSION_VIEW_ADD,
  DATA_EXTENSION_VIEW_DELETE,
  DATA_EXTENSION_VIEW_EDIT,
  DATA_EXTENSION_VIEWS,
} from '../graphql/views';

export type IDataExtensionViewInput = Partial<
  Omit<IDataExtensionView, '_id' | 'createdBy'>
>;

export const useDataExtensionViews = (recordType: string) => {
  const { data, loading } = useQuery<{ dataExtensionViews: IDataExtensionView[] }>(
    DATA_EXTENSION_VIEWS,
    { variables: { recordType }, fetchPolicy: 'cache-and-network' },
  );
  const options = { refetchQueries: ['DataExtensionViews'], awaitRefetchQueries: true };
  const [add, addState] = useMutation(DATA_EXTENSION_VIEW_ADD, options);
  const [edit, editState] = useMutation(DATA_EXTENSION_VIEW_EDIT, options);
  const [remove, removeState] = useMutation(DATA_EXTENSION_VIEW_DELETE, options);

  return {
    views: data?.dataExtensionViews || [],
    loading,
    saving: addState.loading || editState.loading || removeState.loading,
    addView: async (input: IDataExtensionViewInput) =>
      (await add({ variables: { input: { ...input, recordType } } })).data
        ?.dataExtensionViewAdd as IDataExtensionView,
    editView: (_id: string, input: IDataExtensionViewInput) =>
      edit({ variables: { _id, input } }),
    deleteView: (_id: string) => remove({ variables: { _id } }),
  };
};
