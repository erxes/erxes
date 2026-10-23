import { useQuery } from '@apollo/client';
import { BRANCH_LIST_DETAIL } from '../graphql/queries';

export const useBranchDetail = ({ id }: { id?: string | null }) => {
  const { data, loading, error } = useQuery(BRANCH_LIST_DETAIL, {
    variables: id ? { id } : undefined,
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const branchDetail = data?.bmsBranchDetail;

  return { branchDetail, loading, error };
};
