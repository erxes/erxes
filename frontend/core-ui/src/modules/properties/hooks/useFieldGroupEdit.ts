import { useMutation } from '@apollo/client';
import { FIELD_GROUP_EDIT } from '../graphql/mutations/propertiesMutations';

export const useFieldGroupEdit = () => {
  const [editFieldGroup, { loading }] = useMutation(FIELD_GROUP_EDIT);

  return { editFieldGroup, loading };
};
