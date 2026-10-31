import { useMutation } from '@apollo/client';
import {
  ADD_PACKAGE,
  CHANGE_PACKAGE_STATUS,
  EDIT_PACKAGE,
  REMOVE_PACKAGES,
} from '../graphql/packageMutations';
import { GET_PACKAGE_DETAIL, GET_PACKAGES } from '../graphql/packageQueries';

export const useAddPackage = () => {
  const [mutate, { loading }] = useMutation(ADD_PACKAGE, {
    refetchQueries: [GET_PACKAGES],
    awaitRefetchQueries: true,
  });
  return { addPackage: mutate, loading };
};

export const useEditPackage = (id?: string | null) => {
  const [mutate, { loading }] = useMutation(EDIT_PACKAGE, {
    refetchQueries: [
      GET_PACKAGES,
      ...(id ? [{ query: GET_PACKAGE_DETAIL, variables: { _id: id } }] : []),
    ],
    awaitRefetchQueries: true,
  });
  return { editPackage: mutate, loading };
};

export const useChangePackageStatus = () => {
  const [mutate, { loading }] = useMutation(CHANGE_PACKAGE_STATUS, {
    refetchQueries: [GET_PACKAGES],
    awaitRefetchQueries: true,
  });
  return { changeStatus: mutate, loading };
};

export const useRemovePackages = () => {
  const [mutate, { loading }] = useMutation(REMOVE_PACKAGES, {
    refetchQueries: [GET_PACKAGES],
    awaitRefetchQueries: true,
  });
  return { removePackages: mutate, loading };
};
