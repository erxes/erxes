import { useMutation } from '@apollo/client';
import { CREATE_BRANCH } from '../graphql/mutation';
import type {
  BmsBranchAddMutation,
  BmsBranchAddMutationVariables,
} from '~/gql/graphql';

export const useCreateBranch = () => {
  const [createBranchMutation, { loading, error }] = useMutation(
    CREATE_BRANCH,
    {
      refetchQueries: ['BmsBranchList'],
      awaitRefetchQueries: true,
    },
  );

  const createBranch = (options: {
    variables: BmsBranchAddMutationVariables;
    onCompleted?: (data: BmsBranchAddMutation) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createBranchMutation(options);
  };

  return {
    createBranch,
    loading,
    error,
  };
};
