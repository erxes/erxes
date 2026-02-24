import { useMutation } from '@apollo/client';
import { pmsMutations } from '@/pms/graphql/mutation';
import { pmsQueries } from '@/pms/graphql/queries';
import { toast } from 'erxes-ui';

interface PmsBranchRemoveResponse {
  pmsBranchRemove: unknown;
}

interface PmsBranchListQueryData {
  pmsBranchList: Array<{ _id: string }>;
}

interface PmsBranchRemoveVariables {
  _id: string;
}

export const usePmsRemoveBranch = () => {
  const [removeBranchMutation, { loading, error }] = useMutation<
    PmsBranchRemoveResponse,
    PmsBranchRemoveVariables
  >(pmsMutations.PmsBranchRemove, {
    update(cache, _result, { variables }) {
      const deletedId = variables?._id;

      if (!deletedId) {
        return;
      }

      cache.updateQuery(
        {
          query: pmsQueries.PmsBranchList,
          variables: {
            page: 1,
            perPage: 50,
          },
        },
        (data: PmsBranchListQueryData | null) => {
          const prev = data?.pmsBranchList ?? [];

          return {
            ...(data ?? { pmsBranchList: [] }),
            pmsBranchList: prev.filter((b) => b._id !== deletedId),
          };
        },
      );
    },
  });

  const removeBranch = async (options: {
    variables: PmsBranchRemoveVariables;
    onCompleted?: (data: PmsBranchRemoveResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    try {
      const result = await removeBranchMutation({
        variables: options.variables,
      });

      toast({
        title: 'Success',
        description: 'Branch removed successfully',
      });

      if (result.data) {
        options.onCompleted?.(result.data);
      }

      return result;
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to remove branch',
        variant: 'destructive',
      });

      options.onError?.(e);
      throw e;
    }
  };

  return { removeBranch, loading, error };
};
