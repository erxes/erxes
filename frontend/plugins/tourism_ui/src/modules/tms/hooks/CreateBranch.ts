import { useMutation } from '@apollo/client';
import { CREATE_BRANCH_BRANCH } from '../graphql/mutation';
import { IBranch } from '../types/branch';

interface CreateBranchResponse {
  bmsBranchAdd: IBranch;
}

export interface ICreateBranchVariables {
  name: string;
  description?: string;
  user1Ids?: string[];
  user2Ids?: string[];
  paymentIds?: string[];
  paymentTypes?: any[];
  departmentId?: string;
  token?: string;
  erxesAppToken?: string;
  permissionConfig?: any;
  uiOptions?: any;
}

export const useCreateBranch = () => {
  const [createBranchMutation, { loading, error }] = useMutation<
    CreateBranchResponse,
    ICreateBranchVariables
  >(CREATE_BRANCH_BRANCH);

  const createBranch = (options: {
    variables: ICreateBranchVariables;
    onCompleted?: (data: CreateBranchResponse) => void;
    onError?: (error: any) => void;
  }) => {
    return createBranchMutation(options);
  };

  return { createBranch, loading, error };
};
