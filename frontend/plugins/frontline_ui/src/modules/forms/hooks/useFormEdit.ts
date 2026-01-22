import { useMutation } from '@apollo/client';
import { FORM_EDIT } from '../graphql/formMutations';

export const useFormEdit = () => {
  const [editForm, { loading }] = useMutation(FORM_EDIT);
  return {
    editForm,
    loading,
  };
};
