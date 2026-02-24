import { useMutation } from '@apollo/client';
import { pmsMutations } from '../graphql/mutation';
import { pmsQueries } from '../graphql/queries';
import {
  IPmsBranch,
  IPmsDiscount,
  IPmsPaymentType,
  IPmsPipelineConfig,
  IPmsUiOptions,
} from '../types/branch';

interface PmsCreateBranchResponse {
  pmsBranchAdd: IPmsBranch;
}

export interface PmsCreateBranchVariables {
  name: string;
  description?: string;
  departmentId?: string;
  token?: string;
  erxesAppToken?: string;
  user1Ids?: string[];
  user2Ids?: string[];
  user3Ids?: string[];
  user4Ids?: string[];
  user5Ids?: string[];
  paymentIds?: string[];
  paymentTypes?: IPmsPaymentType[];
  uiOptions?: IPmsUiOptions;
  permissionConfig?: any;
  pipelineConfig?: IPmsPipelineConfig;
  extraProductCategories?: string[];
  roomCategories?: string[];
  discount?: IPmsDiscount[];
  time?: string;
  checkintime: string;
  checkouttime: string;
  checkinamount?: number;
  checkoutamount?: number;
}

export const usePmsCreateBranch = () => {
  const [createPmsBranchMutation, { loading, error }] = useMutation<
    PmsCreateBranchResponse,
    PmsCreateBranchVariables
  >(pmsMutations.PmsBranchAdd, {
    refetchQueries: [
      {
        query: pmsQueries.PmsBranchList,
        variables: {
          page: 1,
          perPage: 50,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  const createPmsBranch = (options: {
    variables: PmsCreateBranchVariables;
    onCompleted?: (data: PmsCreateBranchResponse) => void;
    onError?: (error: any) => void;
  }) => {
    return createPmsBranchMutation(options);
  };

  return { createPmsBranch, loading, error };
};
