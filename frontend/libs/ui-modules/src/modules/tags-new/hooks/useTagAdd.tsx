import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';
import { useToast } from 'erxes-ui';
import { ADD_TAG } from 'ui-modules/modules/tags-new/graphql/tagMutations';
import { TAGS_QUERY } from 'ui-modules/modules/tags-new/graphql/tagQueries';
import { AddTagMutationResponse } from 'ui-modules/modules/tags-new/types/TagMutationTypes';

export const useTagAdd = () => {
  const { toast } = useToast();
  const [addTag, { loading }] = useMutation<
    AddTagMutationResponse,
    OperationVariables
  >(ADD_TAG);

  const mutate = ({
    variables,
    ...options
  }: MutationHookOptions<AddTagMutationResponse, OperationVariables>) => {
    addTag({
      ...options,
      variables,
      onError: (error) => {
        toast({
          title: error?.message || 'Failed to add tag',
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: 'Tag added successfully',
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: TAGS_QUERY,
          variables: {
            excludeWorkspaceTags: true,
            type: variables?.type,
          },
        },
      ],
    });
  };

  return {
    addTag: mutate,
    loading,
  };
};
