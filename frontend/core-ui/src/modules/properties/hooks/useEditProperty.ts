import { FIELD_EDIT } from '../graphql/mutations/propertiesMutations';
import { useMutation } from '@apollo/client';

export const useEditProperty = () => {
  const [editProperty, { loading }] = useMutation(FIELD_EDIT);

  return {
    editProperty,
    loading,
  };
};
