import { OperationVariables, useQuery } from '@apollo/client';
import { queries } from '@/settings/team-member/graphql';
import { IBranch } from '@/settings/team-member/types';

export type TBranch = {
  _id: string;
  title: string;
  code: string;
  parentId: string;
};

const useBranch = (options?: OperationVariables) => {
  const { data, loading } = useQuery<{ branches: IBranch[] }>(
    queries.GET_BRANCHES_QUERY,
    {
      ...options,
      onError(error) {
        console.error(error.message);
      },
    },
  );

  return { branches: data?.branches, loading };
};

export { useBranch };
