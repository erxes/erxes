import { MutationHookOptions, useMutation } from '@apollo/client';
import { TAGS_QUERY } from '../graphql/queries/tagsQueries';
import { ADD_TAG } from '../graphql/mutations/tagsMutations';
import { useToast } from 'erxes-ui';

export const useTagsAdd = () => {
  const { toast } = useToast();
  const [addTag, { loading }] = useMutation(ADD_TAG);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    addTag({
      ...options,
      variables,
      optimisticResponse: {
        tagsAdd: {
          __typename: 'Tag',
          _id: 'new',
          name: variables?.name,
          colorCode: variables?.colorCode,
          isGroup: variables?.isGroup || false,
          parentId: variables?.parentId || null,
          description: variables?.description || null,
          type: variables?.type,
          createdAt: new Date().toISOString(),
          relatedIds: variables?.relatedIds || null,
          order: variables?.order || null,
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
      update: (cache, { data: { tagsAdd } }) => {
        cache.updateQuery(
          {
            query: TAGS_QUERY,
            variables: {
              type: variables?.type,
            },
          },
          (data) => ({
            tags: {
              ...data?.tags,
              list: [tagsAdd, ...(data?.tags?.list || [])],
              totalCount: data?.tags?.totalCount + 1,
            },
          }),
        );
      },
    });
  };

  return {
    addTag: mutate,
    loading,
  };
};
