import { useMutation } from '@apollo/client';
import { FIELD_ADD } from '../graphql/mutations/propertiesMutations';

export const useAddProperty = () => {
  const [addProperty, { loading }] = useMutation(FIELD_ADD);
  return { addProperty, loading };
};
