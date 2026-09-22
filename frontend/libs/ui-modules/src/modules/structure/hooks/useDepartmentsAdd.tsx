import { MutationHookOptions, useMutation } from '@apollo/client';
import { DEPARTMENTS_ADD } from '../graphql/mutations/addDepartments';
import { GET_DEPARTMENTS } from '../graphql/queries/getDepartments';

export const useDepartmentsAdd = () => {
  const [departmentsAdd, { loading }] = useMutation(DEPARTMENTS_ADD);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    departmentsAdd({
      ...options,
      variables,
      refetchQueries: [GET_DEPARTMENTS],
    });
  };

  return { departmentsAdd: mutate, loading };
};
