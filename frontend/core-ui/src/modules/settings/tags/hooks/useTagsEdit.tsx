import { MutationHookOptions, useMutation } from '@apollo/client';
import { EDIT_TAG } from '../graphql/mutations/tagsMutations';
import { useToast } from 'erxes-ui';

export const useTagsEdit = () => {
  const [editTagMutation, { loading, error }] = useMutation(EDIT_TAG);
  const { toast } = useToast();

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editTagMutation({
      ...options,
      variables,
      update: (cache, { data: { tagsEdit } }) => {
        cache.modify({
          id: cache.identify(tagsEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string, () => any>, field) => {
              fields[field] = () => (variables || {})[field];
              return fields;
            },
            {},
          ),
          optimistic: true,
        });
      },
      onCompleted: (data) => {
        if (data?.tagsEdit) {
          toast({ title: 'Tag updated successfully!' });
        }
      },
      onError: (error) => {
        toast({
          title: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { tagsEdit: mutate, loading, error };
};
