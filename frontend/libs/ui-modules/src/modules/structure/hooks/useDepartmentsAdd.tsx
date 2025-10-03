import { MutationHookOptions, useMutation } from '@apollo/client';
import { DEPARTMENTS_ADD } from '../graphql/mutations/addDepartments';

export const useDepartmentsAdd = () => {
  const [departmentsAdd, { loading }] = useMutation(DEPARTMENTS_ADD);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    departmentsAdd({
      ...options,
      variables,
      refetchQueries: ['DepartmentsMain'],
    });
  };

  return { departmentsAdd: mutate, loading };
};
