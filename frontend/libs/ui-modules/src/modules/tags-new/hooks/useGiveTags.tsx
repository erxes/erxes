import { MutationHookOptions, useMutation } from '@apollo/client';
import { GIVE_TAGS } from 'ui-modules/modules/tags-new/graphql/tagMutations';
import { toast } from 'erxes-ui';
import {
  GiveTagsMutationResponse,
  GiveTagsMutationVariables,
} from 'ui-modules/modules/tags-new/types/TagMutations';

export const useGiveTags = (
  options?: MutationHookOptions<
    GiveTagsMutationResponse,
    GiveTagsMutationVariables
  >,
) => {
  const [giveTags, { loading }] = useMutation<
    GiveTagsMutationResponse,
    GiveTagsMutationVariables
  >(GIVE_TAGS, {
    ...options,
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      options?.onError?.(error);
    },
  });

  return { giveTags, loading };
};
