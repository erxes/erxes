import { useMutation } from '@apollo/client';
import { FORMS_FIELD_ADD, FORMS_ADD } from '../graphql/formMutations';

interface FormAddResponse {
  formsAdd: {
    _id: string;
  };
}
interface FormFieldAddResponse {
  formFieldAdd: {
    _id: string;
  };
}
export function useFormAdd() {
  const [mutate, { data, loading, error }] =
    useMutation<FormAddResponse>(FORMS_ADD);

  return {
    addForm: mutate,
    formAddData: data,
    isAddingForm: loading,
    addFormError: error,
  };
}

export function useFormFieldAdd() {
  const [mutate, { loading }] =
    useMutation<FormFieldAddResponse>(FORMS_FIELD_ADD);

  return {
    addFormField: mutate,
    loading,
  };
}
