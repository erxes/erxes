import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';
import { EDIT_TAG } from '../graphql/tagMutations';

export const useTagEdit = () => {
  const [editTag, { loading }] = useMutation(EDIT_TAG);

  const mutate = (options: MutationHookOptions) => {
    editTag({
      ...options,
      // optimisticResponse: {
      //   tagsEdit: {
      //     __typename: 'Tag',
      //     _id: 'new',
      //     name: variables?.name || '',
      //     colorCode: variables?.colorCode || '',
      //     isGroup: variables?.isGroup || false,
      //     parentId: variables?.parentId || null,
      //     description: variables?.description || null,
      //     type: variables?.type,
      //     createdAt: new Date().toISOString(),
      //     relatedIds: variables?.relatedIds || null,
      //     order: variables?.order || null,
      //     objectCount: variables?.objectCount || null,
      //     totalObjectCount: variables?.totalObjectCount || null,
      //   },
      // },
      update: (cache, { data: { tagsEdit } }) => {
        cache.modify({
          id: cache.identify(tagsEdit),
          fields: Object.keys(options.variables || {}).reduce(
            (fields: Record<string, () => any>, field) => {
              fields[field] = () =>
                (options.variables || {})[field as keyof ITag];
              return fields;
            },
            {},
          ),
        });
      },
      onCompleted: (data) => {
        if (data?.tagsEdit) {
          toast({ title: 'Tag updated successfully!' });
        }
        options.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: error?.message || 'Failed to update tag',
          variant: 'destructive',
        });
        options.onError?.(error);
      },
    });
  };

  return {
    editTag: mutate,
    loading,
  };
};
