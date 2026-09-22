import { useMutation } from '@apollo/client';
import { FIELD_REMOVE } from '../graphql/mutations/propertiesMutations';

export const useFieldsBulkRemove = () => {
  const [removeField, { loading }] = useMutation(FIELD_REMOVE, {
    refetchQueries: ['Fields'],
  });

  const removeFields = (ids: string[]) =>
    Promise.all(ids.map((id) => removeField({ variables: { id } })));

  return {
    removeFields,
    loading,
  };
};
