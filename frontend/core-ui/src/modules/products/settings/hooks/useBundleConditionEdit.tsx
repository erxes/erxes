import { MutationHookOptions, useMutation } from '@apollo/client';
import { BUNDLE_CONDITION_EDIT } from '../graphql/mutations/bundleConditions';
import { useToast } from 'erxes-ui';

export const useBundleConditionEdit = () => {
  const [editMutation, { loading, error }] = useMutation(BUNDLE_CONDITION_EDIT);
  const { toast } = useToast();

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editMutation({
      ...options,
      variables,
      update: (cache, { data: { bundleConditionEdit } }) => {
        cache.modify({
          id: cache.identify(bundleConditionEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string, () => unknown>, field) => {
              if (field !== '_id') {
                fields[field] = () => (variables || {})[field];
              }
              return fields;
            },
            {}
          ),
        });
      },
      onCompleted: (data) => {
        if (data?.bundleConditionEdit) {
          toast({
            title: 'Bundle condition updated successfully',
            variant: 'success',
          });
          options?.onCompleted?.(data);
        }
      },
      onError: (err) => {
        toast({
          title: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { bundleConditionEdit: mutate, loading, error };
};
