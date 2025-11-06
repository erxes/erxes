import { useMutation } from '@apollo/client';
import { CREATE_BRANCH } from '../graphql/mutation';
import { IBranch } from '../types/branch';

interface CreateBranchResponse {
  bmsBranchAdd: IBranch;
}

export interface ICreateBranchVariables {
  name: string;
  description?: string;
  generalManagerIds?: string[];
  managerIds?: string[];
  paymentIds?: string[];
  departmentId?: string;
  token?: string;
  erxesAppToken?: string;
  permissionConfig?: {
    _id?: string;
    type: string;
    title: string;
    icon: string;
    config?: string;
  }[];
  uiOptions?: {
    logo?: string;
    favIcon?: string;
    colors?: {
      primary?: string;
    };
  };
}

export const useCreateBranch = () => {
  const [createBranchMutation, { loading, error }] = useMutation<
    CreateBranchResponse,
    ICreateBranchVariables
  >(CREATE_BRANCH, {
    refetchQueries: ['BmsBranchList'],
    awaitRefetchQueries: true,
  });

  const createBranch = (options: {
    variables: ICreateBranchVariables;
    onCompleted?: (data: CreateBranchResponse) => void;
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
