import { useMutation } from '@apollo/client';
import { FORMS_ADD } from '../graphql/formMutations';

export function useFormAdd() {
  const [mutate, { data, loading, error, client }] = useMutation(FORMS_ADD);

  return {
    addForm: mutate,
    formAddData: data,
    isAddingForm: loading,
    addFormError: error,
    client,
  };
}
