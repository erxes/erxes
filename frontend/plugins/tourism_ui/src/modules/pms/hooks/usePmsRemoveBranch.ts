import { useMutation } from '@apollo/client';
import { pmsMutations } from '@/pms/graphql/mutation';

interface PmsBranchRemoveResponse {
  pmsBranchRemove: unknown;
}

interface PmsBranchRemoveVariables {
  id: string;
}

export const usePmsRemoveBranch = () => {
  const [removeBranchMutation, { loading, error }] = useMutation<
    PmsBranchRemoveResponse,
    PmsBranchRemoveVariables
  >(pmsMutations.PmsBranchRemove, {
    update(cache, result, options) {
      if (!result.data?.pmsBranchRemove) {
        return;
      }

      const deletedId = options?.variables?.id;

      if (!deletedId) {
        return;
      }

      cache.evict({ id: `PmsBranch:${deletedId}` });
      cache.evict({ fieldName: 'pmsBranchList' });
      cache.gc();
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

      if (!result.data?.pmsBranchRemove) {
        throw new Error('Mutation returned no data');
      }

      options.onCompleted?.(result.data);

      return result;
    } catch (e: unknown) {
      options.onError?.(e);
      throw e;
    }
  };

  return { removeBranch, loading, error };
};
