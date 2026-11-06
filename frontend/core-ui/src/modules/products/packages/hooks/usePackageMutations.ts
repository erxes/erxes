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
    refetchQueries: [{ query: GET_PACKAGES }],
  });
  return { addPackage: mutate, loading };
};

export const useEditPackage = (id?: string | null) => {
  const [mutate, { loading }] = useMutation(EDIT_PACKAGE, {
    refetchQueries: [
      { query: GET_PACKAGES },
      ...(id ? [{ query: GET_PACKAGE_DETAIL, variables: { _id: id } }] : []),
    ],
  });
  return { editPackage: mutate, loading };
};

export const useChangePackageStatus = () => {
  const [mutate, { loading }] = useMutation(CHANGE_PACKAGE_STATUS, {
    refetchQueries: [{ query: GET_PACKAGES }],
  });
  return { changeStatus: mutate, loading };
};

export const useRemovePackages = () => {
  const [mutate, { loading }] = useMutation(REMOVE_PACKAGES, {
    refetchQueries: [{ query: GET_PACKAGES }],
  });
  return { removePackages: mutate, loading };
};
