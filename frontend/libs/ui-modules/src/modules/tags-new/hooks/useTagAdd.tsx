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
        // Readers use different variable shapes (`useGetTags` reads `{ type }`
        // while settings views read `{ excludeWorkspaceTags: true, type }`),
        // so append to both cache entries. Missing entries throw and are ignored.
        const variableSets = [
          { type: variables?.type },
          { excludeWorkspaceTags: true, type: variables?.type },
        ];
        variableSets.forEach((queryVariables) => {
          try {
            cache.updateQuery(
              {
                query: TAGS_QUERY,
                variables: queryVariables,
              },
              (data) => ({
                tagsMain: [tagsAdd, ...(data?.tagsMain || [])],
              }),
            );
          } catch (error) {
            console.error(error);
          }
        });
      },
    });
  };

  return {
    addTag: mutate,
    loading,
  };
};
