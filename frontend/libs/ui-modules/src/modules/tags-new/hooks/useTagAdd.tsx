import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';
import { TAGS_QUERY } from 'ui-modules/modules/tags-new/graphql/tagQueries';
import { ADD_TAG } from 'ui-modules/modules/tags-new/graphql/tagMutations';
import { useToast } from 'erxes-ui';
import { AddTagMutationResponse } from 'ui-modules/modules/tags-new/types/TagMutations';

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
      optimisticResponse: {
        tagsAdd: {
          __typename: 'Tag',
          _id: `new-tag-${Date.now()}`,
          name: variables?.name,
          colorCode: variables?.colorCode,
          isGroup: variables?.isGroup || false,
          parentId: variables?.parentId || null,
          description: variables?.description || null,
          type: variables?.type,
          createdAt: new Date().toISOString(),
          relatedIds: variables?.relatedIds || null,
          objectCount: variables?.objectCount || null,
          totalObjectCount: variables?.totalObjectCount || null,
        },
      },
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
      update: (cache, { data }) => {
        const tagsAdd = data?.tagsAdd;
        if (!tagsAdd) return;
        try {
          cache.updateQuery(
            {
              query: TAGS_QUERY,
              variables: {
                type: variables?.type,
              },
            },
            (data) => ({
              tagsMain: [tagsAdd, ...(data?.tagsMain || [])],
            }),
          );
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  return {
    addTag: mutate,
    loading,
  };
};
