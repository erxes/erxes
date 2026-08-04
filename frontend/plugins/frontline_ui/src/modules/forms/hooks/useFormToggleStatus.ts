import { useMutation } from '@apollo/client';
import { FORM_TOGGLE_STATUS } from '../graphql/formMutations';

export const useFormToggleStatus = () => {
  const [toggleStatus, { loading }] = useMutation(FORM_TOGGLE_STATUS);
  return {
    toggleStatus,
    loading,
  };
};
