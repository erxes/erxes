import { MutationHookOptions, useMutation } from '@apollo/client';
import { UOMS_EDIT } from '../graphql/mutations/cudUoms';
import { useToast } from 'erxes-ui';

export const useUomsEdit = () => {
  const [editUomMutation, { loading, error }] = useMutation(UOMS_EDIT);
  const { toast } = useToast();

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editUomMutation({
      ...options,
      variables,
      update: (cache, { data: { uomsEdit } }) => {
        cache.modify({
          id: cache.identify(uomsEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string, () => any>, field) => {
              fields[field] = () => (variables || {})[field];
              return fields;
            },
            {},
          ),
        });
      },
      onCompleted: (data) => {
        if (data?.uomsEdit) {
          toast({ title: 'Uom updated successfully!', variant: 'success' });
          options?.onCompleted?.(data);
        }
      },
      onError: (error) => {
        toast({
          title: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return { uomsEdit: mutate, loading, error };
};
