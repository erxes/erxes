import { useMutation } from '@apollo/client';
import { FORMS_ADD } from '../graphql/formMutations';

interface FormAddResponse {
  formsAdd: {
    _id: string;
  };
}

export function useFormAdd() {
  const [mutate, { data, loading, error, client }] =
    useMutation<FormAddResponse>(FORMS_ADD);

  return {
    addForm: mutate,
    formAddData: data,
    isAddingForm: loading,
    addFormError: error,
    client,
  };
}
